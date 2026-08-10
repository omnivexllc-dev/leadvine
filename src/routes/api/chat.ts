import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai-gateway.server";
import { parseUserPromptToPlan } from "@/services/aiLeadSearch.service";

const SYSTEM_PROMPT = `You are LeadVine's prospecting assistant. Users describe the kind of business leads they want in plain English. Your job is to translate that into concrete search filters and hand them off with the propose_lead_filters tool.

LeadVine's Find Leads tool searches Google Maps (Places) for businesses. That means:
- You CAN filter by: business category / niche (query) and location (city, region, state, or country), and whether the business has a website on file.
- You CANNOT directly filter by: employee count, ad spend, tech stack (Shopify/WordPress), SEO quality, Core Web Vitals, chat widgets, or website age. Places API doesn't expose those.

When the user asks for something Places can't do directly:
1. Still call propose_lead_filters with the best-fit niche + location + onlyMissing.
2. In "notes", explain briefly what part of their request can't be filtered by the source and suggest a next step (e.g. "Use SEO audit or Audit sites on the resulting list to score them").

Always call propose_lead_filters once per user turn unless the user is just chatting/asking a question. Keep any chat text short (1-3 sentences). Do not paste raw JSON in your reply — the tool call is the structured output.`;

const filterSchema = z.object({
  query: z
    .string()
    .describe(
      "Business type / niche to search for on Google Maps (e.g. 'roofing companies', 'dentists', 'coffee shops').",
    ),
  location: z
    .string()
    .describe(
      "Location filter — city, state, region, or country (e.g. 'Austin, TX', 'California', 'New York City').",
    ),
  onlyMissing: z
    .boolean()
    .describe(
      "If true, only show businesses that have no website on file. Default true when the user is doing outbound web-services prospecting.",
    ),
  notes: z
    .string()
    .optional()
    .describe(
      "1-3 sentence explanation of assumptions or of any part of the user's request that can't be applied directly.",
    ),
});

function makeSupabase(token: string) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        let userId = "usr_demo_user";

        if (
          token &&
          token.split(".").length === 3 &&
          process.env.SUPABASE_URL &&
          process.env.SUPABASE_PUBLISHABLE_KEY
        ) {
          try {
            const supabase = makeSupabase(token);
            const { data: claimData, error: claimErr } = await supabase.auth.getClaims(token);
            if (!claimErr && claimData?.claims?.sub) {
              userId = claimData.claims.sub as string;
            }
          } catch (e) {
            console.warn("[chat] Supabase claim verification fallback:", e);
          }
        }

        const body = (await request.json().catch(() => ({}))) as {
          messages?: UIMessage[];
          threadId?: string;
        };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const threadId = body.threadId || `thread-${Date.now()}`;

        // Get last user prompt text
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        const lastUserText =
          lastUser?.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join(" ") || "find leads";

        // Attempt thread lookup/persistence via Supabase, fallback gracefully on missing tables/errors
        if (
          process.env.SUPABASE_URL &&
          process.env.SUPABASE_PUBLISHABLE_KEY &&
          token &&
          token.split(".").length === 3
        ) {
          try {
            const supabase = makeSupabase(token);
            if (lastUser) {
              await supabase
                .from("chat_messages")
                .insert({
                  thread_id: threadId,
                  user_id: userId,
                  role: "user",
                  parts: lastUser.parts as never,
                })
                .catch(() => {});
            }
          } catch (e) {
            console.warn("[chat] Supabase message save skipped:", e);
          }
        }

        const hasApiKey = Boolean(
          process.env.GEMINI_API_KEY ||
          process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
          process.env.LOVABLE_API_KEY,
        );

        if (hasApiKey) {
          try {
            const model = getAiModel();
            const result = streamText({
              model,
              system: SYSTEM_PROMPT,
              messages: await convertToModelMessages(messages),
              stopWhen: stepCountIs(4),
              tools: {
                propose_lead_filters: tool({
                  description:
                    "Propose the Find Leads filter set that best matches the user's request. Always call this when the user is describing leads they want, even if some criteria (employee count, ad spend, tech stack, SEO) can't be applied directly.",
                  inputSchema: filterSchema,
                  execute: async (rawInput) => {
                    const parsed = filterSchema.safeParse(rawInput);
                    if (!parsed.success) {
                      console.warn(
                        "[chat] Tool propose_lead_filters input validation warning:",
                        parsed.error.format(),
                      );
                      // Return sanitized fallback matching schema
                      return {
                        query:
                          typeof rawInput === "object" && rawInput && "query" in rawInput
                            ? String((rawInput as Record<string, unknown>).query)
                            : "Local services",
                        location:
                          typeof rawInput === "object" && rawInput && "location" in rawInput
                            ? String((rawInput as Record<string, unknown>).location)
                            : "Austin, TX",
                        onlyMissing: true,
                        notes: "Validated and sanitized filter set.",
                      };
                    }
                    return parsed.data;
                  },
                }),
              },
            });

            return result.toUIMessageStreamResponse({
              originalMessages: messages,
            });
          } catch (streamErr) {
            console.warn("[chat] Streaming error, falling back to smart plan parser:", streamErr);
          }
        }

        // Fallback response using prompt-to-plan engine
        const plan = parseUserPromptToPlan(lastUserText);
        const filterArgs = {
          query: plan.query || "Local services",
          location: plan.location || "Austin, TX",
          onlyMissing: plan.onlyMissing ?? true,
          notes: plan.reasoning || `Prepared search filters based on: "${lastUserText}"`,
        };

        return createUIMessageStreamResponse({
          originalMessages: messages,
          execute: async ({ writer }) => {
            writer.appendPart({
              type: "text",
              text: `I've analyzed your search request ("${lastUserText}") and generated optimized lead filters:`,
            });
            writer.appendPart({
              type: "tool-invocation",
              toolInvocation: {
                toolCallId: `call-${Date.now()}`,
                toolName: "propose_lead_filters",
                args: filterArgs,
                state: "result",
                result: filterArgs,
              },
            });
          },
        });
      },
    },
  },
});
