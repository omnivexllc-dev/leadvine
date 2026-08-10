import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai-gateway.server";

const inputSchema = z.object({
  current: z.object({
    query: z.string(),
    location: z.string(),
    onlyMissing: z.boolean(),
  }),
  instruction: z.string().min(1).max(1000),
});

const outputSchema = z.object({
  query: z.string(),
  location: z.string(),
  onlyMissing: z.boolean(),
  notes: z.string().optional(),
});

const SYSTEM = `You refine LeadVine Find Leads filters. The tool searches Google Maps (Places) so it supports:
- business type / niche (query)
- location (city, state, region, country)
- onlyMissing (true = only businesses with no website on file)
It CANNOT filter by employee count, ad spend, tech stack, SEO quality, page speed, or website age. If the user asks for those, keep the best-fit query+location and mention the limitation in "notes".
Return an updated full filter set (not a diff). Keep values the user didn't ask to change.`;

export const refineFilters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => inputSchema.parse(i))
  .handler(async ({ data }) => {
    const prompt = `Current filters:
- query: ${data.current.query || "(empty)"}
- location: ${data.current.location || "(empty)"}
- onlyMissing: ${data.current.onlyMissing}

User instruction: ${data.instruction}

Return the updated filters.`;

    try {
      const { output } = await generateText({
        model: getAiModel(),
        system: SYSTEM,
        prompt,
        output: Output.object({ schema: outputSchema }),
      });
      return output;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Refine failed");
    }
  });
