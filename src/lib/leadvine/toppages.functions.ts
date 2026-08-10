import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FC_BASE = "https://api.firecrawl.dev/v2";

const input = z.object({
  url: z.string().url().max(500),
  useSitemap: z.boolean().default(true),
  useSearch: z.boolean().default(true),
});

type Citation =
  | { source: "sitemap"; sitemapUrl: string; position: number; totalUrls: number }
  | { source: "search"; query: string; resultUrl: string; position: number; endpoint: string };

type PageRow = {
  url: string;
  path: string;
  title?: string;
  sources: string[];
  sitemapRank?: number;
  searchRank?: number;
  estTrafficShare: number; // 0-100
  confidence: "high" | "medium" | "low";
  citations: Citation[];
};

function normalizePath(u: string, origin: string) {
  try {
    const url = new URL(u, origin);
    if (url.origin !== origin) return null;
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return null;
  }
}

async function fetchSitemapUrls(origin: string): Promise<{ url: string; sourceSitemap: string }[]> {
  const collected: { url: string; sourceSitemap: string }[] = [];
  const seen = new Set<string>();
  const queue: string[] = [];

  // Try robots.txt for Sitemap: lines
  try {
    const r = await fetch(`${origin}/robots.txt`, { redirect: "follow" });
    if (r.ok) {
      const text = await r.text();
      for (const m of text.matchAll(/^\s*Sitemap:\s*(\S+)/gim)) queue.push(m[1]);
    }
  } catch {
    // ignore
  }
  if (queue.length === 0) queue.push(`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`);

  while (queue.length && collected.length < 500) {
    const sm = queue.shift()!;
    if (seen.has(sm)) continue;
    seen.add(sm);
    try {
      const r = await fetch(sm, { redirect: "follow" });
      if (!r.ok) continue;
      const xml = await r.text();
      const locs = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1]);
      if (/<sitemapindex/i.test(xml)) {
        for (const l of locs) queue.push(l);
      } else {
        for (const l of locs) collected.push({ url: l, sourceSitemap: sm });
      }
    } catch {
      // ignore
    }
  }
  return collected;
}

async function firecrawlSearch(
  query: string,
): Promise<{ url: string; title?: string; endpoint: string }[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  const endpoint = `${FC_BASE}/search`;
  if (!key) return [];
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query, limit: 25 }),
    });
    if (!res.ok) return [];
    const j = (await res.json()) as {
      data?: { web?: { url: string; title?: string }[] } | Array<{ url: string; title?: string }>;
    };
    const raw = Array.isArray(j.data) ? j.data : (j.data?.web ?? []);
    return raw.map((r) => ({ url: r.url, title: r.title, endpoint }));
  } catch {
    return [];
  }
}

// Heuristic: shallower paths and earlier sitemap position score higher.
function heuristicScore(path: string, index: number, total: number): number {
  const depth = path === "/" ? 0 : path.split("/").filter(Boolean).length;
  const depthScore = Math.max(0, 100 - depth * 22);
  const orderScore = Math.max(0, 100 - (index / Math.max(1, total)) * 80);
  const homeBoost = path === "/" ? 40 : 0;
  return depthScore * 0.55 + orderScore * 0.3 + homeBoost * 0.15;
}

type SocialPlatform = "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "youtube";

type SocialHit = {
  platform: SocialPlatform;
  url: string;
  handle?: string;
  foundOn: string;
};

const SOCIAL_PATTERNS: {
  platform: SocialPlatform;
  re: RegExp;
  handleFrom?: (u: URL) => string | undefined;
}[] = [
  {
    platform: "facebook",
    re: /^(?:www\.|m\.|web\.)?facebook\.com$|^fb\.com$/i,
    handleFrom: (u) => u.pathname.split("/").filter(Boolean)[0],
  },
  {
    platform: "instagram",
    re: /^(?:www\.)?instagram\.com$/i,
    handleFrom: (u) => u.pathname.split("/").filter(Boolean)[0],
  },
  {
    platform: "linkedin",
    re: /^(?:www\.|[a-z]{2}\.)?linkedin\.com$/i,
    handleFrom: (u) => {
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] && parts[1] ? `${parts[0]}/${parts[1]}` : parts[0];
    },
  },
  {
    platform: "twitter",
    re: /^(?:www\.|mobile\.)?(?:twitter\.com|x\.com)$/i,
    handleFrom: (u) => u.pathname.split("/").filter(Boolean)[0],
  },
  {
    platform: "tiktok",
    re: /^(?:www\.)?tiktok\.com$/i,
    handleFrom: (u) => u.pathname.split("/").filter(Boolean)[0]?.replace(/^@?/, "@"),
  },
  {
    platform: "youtube",
    re: /^(?:www\.|m\.)?youtube\.com$|^youtu\.be$/i,
    handleFrom: (u) => {
      const p = u.pathname.split("/").filter(Boolean)[0];
      return p?.startsWith("@") || p === "c" || p === "channel" || p === "user"
        ? u.pathname.replace(/^\//, "")
        : p;
    },
  },
];

const NON_PROFILE = new Set([
  "sharer",
  "share",
  "intent",
  "dialog",
  "plugins",
  "tr",
  "watch",
  "results",
  "search",
  "hashtag",
  "explore",
  "embed",
]);

function classifySocial(
  href: string,
): { platform: SocialPlatform; url: string; handle?: string } | null {
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();
  for (const spec of SOCIAL_PATTERNS) {
    if (!spec.re.test(host)) continue;
    const firstSeg = u.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (!firstSeg || NON_PROFILE.has(firstSeg)) return null;
    // Twitter share/intent guard
    if (spec.platform === "twitter" && ["intent", "share", "home", "compose"].includes(firstSeg))
      return null;
    const handle = spec.handleFrom?.(u);
    // Strip tracking
    const clean = `${u.origin}${u.pathname}`.replace(/\/$/, "");
    return { platform: spec.platform, url: clean, handle };
  }
  return null;
}

async function findSocials(origin: string): Promise<SocialHit[]> {
  const candidatePaths = ["/", "/contact", "/about", "/contact-us", "/about-us"];
  const hitsByPlatform = new Map<SocialPlatform, SocialHit>();

  await Promise.all(
    candidatePaths.map(async (path) => {
      const pageUrl = `${origin}${path}`;
      try {
        const r = await fetch(pageUrl, { redirect: "follow" });
        if (!r.ok) return;
        const html = await r.text();
        const hrefs = Array.from(html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)).map((m) => m[1]);
        for (const h of hrefs) {
          const abs = h.startsWith("http") ? h : h.startsWith("//") ? `https:${h}` : null;
          if (!abs) continue;
          const c = classifySocial(abs);
          if (!c) continue;
          if (!hitsByPlatform.has(c.platform)) {
            hitsByPlatform.set(c.platform, { ...c, foundOn: pageUrl });
          }
        }
      } catch {
        // ignore
      }
    }),
  );

  return Array.from(hitsByPlatform.values());
}

export const analyzeTopPages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => input.parse(i))
  .handler(async ({ data }) => {
    const origin = new URL(data.url).origin;
    const domain = new URL(data.url).hostname.replace(/^www\./, "");
    const searchQuery = `site:${domain}`;

    const [sitemapUrls, searchResults, socials] = await Promise.all([
      data.useSitemap
        ? fetchSitemapUrls(origin)
        : Promise.resolve<{ url: string; sourceSitemap: string }[]>([]),
      data.useSearch
        ? firecrawlSearch(searchQuery)
        : Promise.resolve<{ url: string; title?: string; endpoint: string }[]>([]),
      findSocials(origin),
    ]);

    const pages = new Map<string, PageRow>();

    // Sitemap contribution
    const sitemapPaths: { path: string; url: string; idx: number; sourceSitemap: string }[] = [];
    sitemapUrls.forEach((entry, i) => {
      const p = normalizePath(entry.url, origin);
      if (!p) return;
      sitemapPaths.push({ path: p, url: entry.url, idx: i, sourceSitemap: entry.sourceSitemap });
    });

    const heuristicRanked = [...sitemapPaths]
      .map((s) => ({ ...s, score: heuristicScore(s.path, s.idx, sitemapPaths.length) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);

    heuristicRanked.forEach((s, rank) => {
      pages.set(s.path, {
        url: s.url,
        path: s.path,
        sources: ["sitemap"],
        sitemapRank: rank + 1,
        estTrafficShare: 0,
        confidence: "low",
        citations: [
          {
            source: "sitemap",
            sitemapUrl: s.sourceSitemap,
            position: s.idx + 1,
            totalUrls: sitemapPaths.length,
          },
        ],
      });
    });

    // Search contribution
    searchResults.forEach((r, i) => {
      const p = normalizePath(r.url, origin);
      if (!p) return;
      const citation: Citation = {
        source: "search",
        query: searchQuery,
        resultUrl: r.url,
        position: i + 1,
        endpoint: r.endpoint,
      };
      const existing = pages.get(p);
      if (existing) {
        if (!existing.sources.includes("search")) existing.sources.push("search");
        existing.searchRank = i + 1;
        if (r.title) existing.title = r.title;
        existing.citations.push(citation);
      } else {
        pages.set(p, {
          url: r.url,
          path: p,
          title: r.title,
          sources: ["search"],
          searchRank: i + 1,
          estTrafficShare: 0,
          confidence: "low",
          citations: [citation],
        });
      }
    });

    // Compute combined score + confidence + est traffic share
    const scored = Array.from(pages.values()).map((p) => {
      const sitemapScore = p.sitemapRank ? Math.max(0, 100 - (p.sitemapRank - 1) * 4) : 0;
      const searchScore = p.searchRank ? Math.max(0, 100 - (p.searchRank - 1) * 4) : 0;
      let combined = 0;
      if (p.sources.includes("sitemap") && p.sources.includes("search")) {
        combined = sitemapScore * 0.45 + searchScore * 0.55;
        p.confidence = "high";
      } else if (p.sources.includes("search")) {
        combined = searchScore * 0.75;
        p.confidence = "medium";
      } else {
        combined = sitemapScore * 0.55;
        p.confidence = "low";
      }
      return { ...p, combined };
    });

    scored.sort((a, b) => b.combined - a.combined);
    const top = scored.slice(0, 20);

    // Normalize into a soft traffic-share distribution (Zipf-ish)
    const weights = top.map((_, i) => 1 / Math.pow(i + 1, 0.85));
    const sum = weights.reduce((s, w) => s + w, 0);
    top.forEach((p, i) => {
      p.estTrafficShare = Math.round((weights[i] / sum) * 1000) / 10; // 1 decimal
    });

    return {
      domain,
      origin,
      generatedAt: new Date().toISOString(),
      sources: {
        sitemap: {
          enabled: data.useSitemap,
          urlsFound: sitemapUrls.length,
          available: sitemapUrls.length > 0,
        },
        search: {
          enabled: data.useSearch,
          resultsFound: searchResults.length,
          available: searchResults.length > 0,
          query: searchQuery,
          endpoint: `${FC_BASE}/search`,
        },
      },
      pages: top.map(({ combined: _c, ...rest }) => rest),
      socials,
    };
  });
