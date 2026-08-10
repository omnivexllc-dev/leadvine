import { firecrawlScrape, scoreSiteAudit, analyzeSeo } from "./audit.server";
import { scoreOneLead } from "./opportunity.server";

export type ScanLead = {
  id: string;
  name: string;
  website: string | null;
  has_website: boolean | null;
  rating: number | null;
  user_ratings_total: number | null;
  phone: string | null;
  last_scanned_at: string | null;
};

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto).toString();
  } catch {
    return null;
  }
}

export function isFresh(lastScannedAt: string | null, days: number): boolean {
  if (!lastScannedAt) return false;
  const ms = Date.now() - new Date(lastScannedAt).getTime();
  return ms < days * 24 * 60 * 60 * 1000;
}

/**
 * Fetch a page ONCE and derive both the site-quality score and the SEO
 * analysis from that single fetch — half the Firecrawl calls of running the
 * two single-lead tools separately.
 */
export async function scanOneSite(url: string) {
  const scraped = await firecrawlScrape(url, ["html", "screenshot"]);
  const html = (scraped.html as string) ?? "";
  const metadata = (scraped.metadata as Record<string, unknown>) ?? {};
  const site = scoreSiteAudit(html, url, metadata);
  const seo = analyzeSeo(html, url, metadata);
  const screenshot = (scraped.screenshot as string) ?? null;
  return { site, seo, screenshot };
}

export { scoreOneLead };
