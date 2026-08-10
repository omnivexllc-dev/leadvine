import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai-gateway.server";

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
        if (!token || token.split(".").length !== 3) {
          return new Response("Unauthorized", { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Missing API key (GEMINI_API_KEY)", { status: 500 });
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Supabase env missing", { status: 500 });
        }

        const supabase = makeSupabase(token);
        const { data: claimData, error: claimErr } = await supabase.auth.getClaims(token);
        if (claimErr || !claimData?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claimData.claims.sub as string;

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const threadId = body.threadId;
        if (!threadId) return new Response("threadId required", { status: 400 });

        // Verify thread ownership
        const { data: threadRow, error: threadErr } = await supabase
          .from("chat_threads")
          .select("id, title")
          .eq("id", threadId)
          .maybeSingle();
        if (threadErr || !threadRow) return new Response("Thread not found", { status: 404 });

        // Persist the latest user message (RLS scopes to auth.uid())
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastUser.parts as never,
          });
        }

        // Title the thread from the first user message if still default
        if (threadRow.title === "New conversation" && lastUser) {
          const text = lastUser.parts
            .map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
            .join(" ")
            .slice(0, 60)
            .trim();
          if (text) {
            await supabase.from("chat_threads").update({ title: text }).eq("id", threadId);
          }
        }

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
              execute: async (input) => input,
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            try {
              await supabase.from("chat_messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: responseMessage.role,
                parts: responseMessage.parts as never,
              });
              await supabase
                .from("chat_threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            } catch (err) {
              console.error("[chat] persist assistant failed", err);
            }
          },
        });
      },
    },
  },
});
