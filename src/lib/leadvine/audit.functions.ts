import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { firecrawlScrape, scoreSiteAudit, analyzeSeo } from "./audit.server";

const siteInput = z.object({ url: z.string().url().max(500) });

export const auditSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => siteInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    try {
      const scraped = await firecrawlScrape(data.url, ["html", "screenshot"]);
      const html = (scraped.html as string) ?? "";
      const metadata = (scraped.metadata as Record<string, unknown>) ?? {};
      const result = scoreSiteAudit(html, data.url, metadata);
      const screenshot = (scraped.screenshot as string) ?? null;

      const { data: row, error } = await supabase
        .from("site_audits")
        .insert({
          user_id: userId,
          url: data.url,
          score: result.score,
          needs_redesign: result.needs_redesign,
          signals: result.signals,
          screenshot_url: screenshot,
        })
        .select()
        .single();
      if (error) throw error;
      return row;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const { data: row } = await supabase
        .from("site_audits")
        .insert({ user_id: userId, url: data.url, error: message })
        .select()
        .single();
      return row;
    }
  });

const seoInput = z.object({ url: z.string().url().max(500) });

export const auditSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => seoInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const scraped = await firecrawlScrape(data.url, ["html"]);
    const html = (scraped.html as string) ?? "";
    const metadata = (scraped.metadata as Record<string, unknown>) ?? {};
    const analysis = analyzeSeo(html, data.url, metadata);

    const { data: row, error } = await supabase
      .from("seo_reports")
      .insert({
        user_id: userId,
        url: data.url,
        score: analysis.score,
        title: analysis.title,
        description: analysis.description,
        data: analysis.data,
        recommendations: analysis.recommendations,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });
