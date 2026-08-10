// Shared audit primitives. Single source of truth for "what counts as a
// redesign" — used by the single-lead Audit Sites / SEO Audit tools and by the
// bulk scanner, so the two can never drift apart.

const FC_BASE = "https://api.firecrawl.dev/v2";

export async function firecrawlScrape(url: string, formats: string[]) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not configured");
  const res = await fetch(`${FC_BASE}/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ url, formats, onlyMainContent: false }),
  });
  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { data?: Record<string, unknown> };
  return json.data ?? {};
}

export function scoreSiteAudit(html: string, url: string, metadata: Record<string, unknown>) {
  const signals: Record<string, boolean | number | string> = {};
  signals.https = url.startsWith("https://");
  signals.mobile_viewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  signals.has_favicon = /<link[^>]*rel=["'](?:shortcut )?icon["']/i.test(html);
  signals.has_og_tags = /<meta[^>]*property=["']og:/i.test(html);
  signals.has_tailwind_or_modern = /(tailwind|_next|astro|vite|nuxt|remix)/i.test(html);
  signals.uses_jquery = /jquery(?:-\d)?(?:\.min)?\.js/i.test(html);
  signals.uses_flash = /\.swf|application\/x-shockwave-flash/i.test(html);
  signals.uses_table_layout = (html.match(/<table[^>]*>/gi)?.length ?? 0) > 3;
  signals.page_size_kb = Math.round(html.length / 1024);
  signals.title = ((metadata.title as string) ?? "").slice(0, 120);

  let score = 100;
  if (!signals.https) score -= 20;
  if (!signals.mobile_viewport) score -= 25;
  if (!signals.has_og_tags) score -= 8;
  if (!signals.has_favicon) score -= 3;
  if (signals.uses_jquery) score -= 10;
  if (signals.uses_flash) score -= 30;
  if (signals.uses_table_layout) score -= 15;
  if (!signals.has_tailwind_or_modern) score -= 10;
  if ((signals.page_size_kb as number) > 3000) score -= 5;

  score = Math.max(0, Math.min(100, score));
  return { score, needs_redesign: score < 60, signals };
}

export function analyzeSeo(html: string, url: string, metadata: Record<string, unknown>) {
  const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? "";
  const title = ((metadata.title as string) ?? pick(/<title[^>]*>([^<]+)<\/title>/i)).trim();
  const description = (
    (metadata.description as string) ??
    pick(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  ).trim();
  const h1s = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim(),
  );
  const h2s = Array.from(html.matchAll(/<h2[^>]*>/gi)).length;
  const canonical = pick(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const ogTitle = pick(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const ogImage = pick(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const images = Array.from(html.matchAll(/<img\b[^>]*>/gi));
  const imagesWithAlt = images.filter((m) => /alt=["'][^"']+["']/i.test(m[0]));
  const links = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)).map(
    (m) => m[1],
  );
  const origin = new URL(url).origin;
  const internal = links.filter((l) => l.startsWith("/") || l.startsWith(origin)).length;
  const external = links.length - internal;
  const wordCount = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const rec: { level: "high" | "med" | "low"; msg: string }[] = [];
  let score = 100;
  if (!title) {
    score -= 20;
    rec.push({ level: "high", msg: "Missing <title> tag" });
  } else if (title.length < 30 || title.length > 65) {
    score -= 5;
    rec.push({ level: "med", msg: `Title length is ${title.length} chars (aim 30–65)` });
  }
  if (!description) {
    score -= 15;
    rec.push({ level: "high", msg: "Missing meta description" });
  } else if (description.length < 70 || description.length > 165) {
    score -= 5;
    rec.push({ level: "med", msg: `Meta description is ${description.length} chars (aim 70–165)` });
  }
  if (h1s.length === 0) {
    score -= 15;
    rec.push({ level: "high", msg: "No H1 heading" });
  } else if (h1s.length > 1) {
    score -= 5;
    rec.push({ level: "med", msg: `${h1s.length} H1 tags — use only one` });
  }
  if (!canonical) {
    score -= 5;
    rec.push({ level: "low", msg: "Add a canonical link tag" });
  }
  if (!ogTitle || !ogImage) {
    score -= 8;
    rec.push({ level: "med", msg: "Add OpenGraph tags (og:title, og:image) for social sharing" });
  }
  const altCoverage = images.length === 0 ? 1 : imagesWithAlt.length / images.length;
  if (altCoverage < 0.8) {
    score -= 8;
    rec.push({
      level: "med",
      msg: `Only ${Math.round(altCoverage * 100)}% of images have alt text`,
    });
  }
  if (wordCount < 300) {
    score -= 8;
    rec.push({ level: "med", msg: `Thin content: ${wordCount} words (aim 300+)` });
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    title,
    description,
    data: {
      h1s,
      h2_count: h2s,
      canonical,
      og_title: ogTitle,
      og_image: ogImage,
      images_total: images.length,
      images_with_alt: imagesWithAlt.length,
      alt_coverage: Math.round(altCoverage * 100),
      internal_links: internal,
      external_links: external,
      word_count: wordCount,
    },
    recommendations: rec,
  };
}
