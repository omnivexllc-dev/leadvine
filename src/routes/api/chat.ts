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

const SYSTEM_PROMPT = `You are LeadVine's prospecting assistant. Users describe the kind of business leads they want in plain English. Your job is to translate that into a structured AI Search Plan and pass it directly to LeadVine's orchestrator using the propose_lead_filters tool.

LeadVine's Lead Discovery Orchestrator executes search plans across Google Places and local business indexes:
1. Extract the target business niche/industry (query) and specific location (city, state, region).
2. Determine the websiteRequirement ('no_website', 'has_website', or 'any'). Set websiteRequirement to 'no_website' and set onlyMissing to true when the user asks for businesses without websites or needing new site builds.
3. Identify the targetOpportunity (e.g., 'Website Redesign', 'Mobile UX & Speed Optimization', 'SEO Audit', 'New Mobile Website Build') and optional secondaryOpportunity.
4. Provide concise notes explaining the strategy and assumptions.

Always call propose_lead_filters once per user turn when the user specifies lead criteria. Keep text responses short (1-3 sentences).`;

const searchPlanSchema = z.object({
  query: z
    .string()
    .describe(
      "Business category or niche to search for (e.g. 'roofing contractors', 'dentists', 'auto repair').",
    ),
  location: z
    .string()
    .describe(
      "Target location — city, state, region, or country (e.g. 'Austin, TX', 'Miami, FL', 'California').",
    ),
  websiteRequirement: z
    .enum(["no_website", "has_website", "any"])
    .default("no_website")
    .describe(
      "Website criteria: 'no_website' for businesses lacking a website, 'has_website' for existing websites needing redesigns/SEO, or 'any'.",
    ),
  onlyMissing: z
    .boolean()
    .default(true)
    .describe(
      "Set to true when filtering strictly for businesses that do not have an official website on file.",
    ),
  targetOpportunity: z
    .string()
    .describe(
      "Primary sales pitch or service offering (e.g. 'Website Redesign', 'Mobile Lead Capture Engine', 'SEO & Speed Boost', 'New Website Build').",
    ),
  secondaryOpportunity: z
    .string()
    .optional()
    .describe("Secondary sales pitch or complementary service."),
  notes: z
    .string()
    .optional()
    .describe("1-3 sentence explanation of assumptions, target profile, or search plan reasoning."),
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
              maxRetries: 0,
              stopWhen: stepCountIs(4),
              tools: {
                propose_lead_filters: tool({
                  description:
                    "Propose the AI Lead Search Plan that best matches the user's request, identifying business niche, location, website requirements, and primary/secondary sales opportunities.",
                  inputSchema: searchPlanSchema,
                  execute: async (rawInput) => {
                    const parsed = searchPlanSchema.safeParse(rawInput);
                    if (!parsed.success) {
                      console.warn(
                        "[chat] Tool propose_lead_filters input validation warning:",
                        parsed.error.format(),
                      );
                      const rawObj =
                        typeof rawInput === "object" && rawInput
                          ? (rawInput as Record<string, unknown>)
                          : {};
                      const isNoWeb =
                        String(rawObj.websiteRequirement || "").toLowerCase() === "no_website" ||
                        rawObj.onlyMissing === true;
                      return {
                        query: String(rawObj.query || "Local services"),
                        location: String(rawObj.location || "Austin, TX"),
                        websiteRequirement: isNoWeb ? "no_website" : "any",
                        onlyMissing: isNoWeb,
                        targetOpportunity: String(
                          rawObj.targetOpportunity || "Website Redesign & Mobile Lead Engine",
                        ),
                        secondaryOpportunity: String(
                          rawObj.secondaryOpportunity || "SEO & Local Citation Boost",
                        ),
                        notes: "Validated and sanitized AI Search Plan.",
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
        const isNoWeb = plan.onlyMissing ?? true;
        const searchPlanArgs = {
          query: plan.query || "Local services",
          location: plan.location || "Austin, TX",
          websiteRequirement: isNoWeb ? "no_website" : "any",
          onlyMissing: isNoWeb,
          targetOpportunity: plan.primaryOpportunity || "Website Redesign & Mobile Lead Engine",
          secondaryOpportunity:
            plan.secondaryOpportunity || "SEO & Google Business Listing Optimization",
          notes: plan.reasoning || `Prepared AI search plan based on: "${lastUserText}"`,
        };

        return createUIMessageStreamResponse({
          originalMessages: messages,
          execute: async ({ writer }) => {
            writer.appendPart({
              type: "text",
              text: `I've analyzed your search request ("${lastUserText}") and generated an optimized AI Lead Search Plan:`,
            });
            writer.appendPart({
              type: "tool-invocation",
              toolInvocation: {
                toolCallId: `call-${Date.now()}`,
                toolName: "propose_lead_filters",
                args: searchPlanArgs,
                state: "result",
                result: searchPlanArgs,
              },
            });
          },
        });
      },
    },
  },
});
