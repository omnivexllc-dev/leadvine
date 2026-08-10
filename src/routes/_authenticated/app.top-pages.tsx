import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Info,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Music2,
} from "lucide-react";
import { analyzeTopPages } from "@/lib/leadvine/toppages.functions";

export const Route = createFileRoute("/_authenticated/app/top-pages")({
  head: () => ({ meta: [{ title: "Top pages — LeadVine" }] }),
  component: TopPagesView,
});

type Confidence = "high" | "medium" | "low";

function ConfBadge({ level }: { level: Confidence }) {
  const map = {
    high: {
      cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      Icon: ShieldCheck,
      label: "High",
    },
    medium: {
      cls: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      Icon: ShieldAlert,
      label: "Medium",
    },
    low: {
      cls: "bg-muted text-muted-foreground border-border",
      Icon: ShieldQuestion,
      label: "Low",
    },
  }[level];
  const { Icon } = map;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${map.cls}`}
    >
      <Icon className="h-3 w-3" /> {map.label}
    </span>
  );
}

function TopPagesView() {
  const [url, setUrl] = useState("");
  const [useSitemap, setUseSitemap] = useState(true);
  const [useSearch, setUseSearch] = useState(true);
  const fn = useServerFn(analyzeTopPages);

  const run = useMutation({
    mutationFn: async () => {
      const u = url.startsWith("http") ? url : `https://${url}`;
      if (!useSitemap && !useSearch) throw new Error("Enable at least one source");
      return fn({ data: { url: u, useSitemap, useSearch } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Analysis failed"),
  });

  const result = run.data;

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Tool</div>
        <h1 className="font-display text-4xl mb-2">Top pages analyzer</h1>
        <p className="text-muted-foreground max-w-2xl">
          Estimate a site's most-visited pages by combining a sitemap-derived structural signal (a
          Similarweb-style depth &amp; ordering proxy) with Google Search visibility. Each row is
          scored with a confidence level based on how many sources agree.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run.mutate();
        }}
        className="rounded-2xl border border-border bg-card p-5 mb-6 space-y-4"
      >
        <div className="flex gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://example.com"
            className="flex-1 bg-background border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-vine"
          />
          <button
            disabled={run.isPending}
            className="bg-vine text-primary-foreground rounded-md py-2.5 px-6 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Analyze
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <SourceToggle
            label="Sitemap + structural estimate"
            hint="Similarweb-style proxy: depth & position weighting"
            checked={useSitemap}
            onChange={setUseSitemap}
          />
          <SourceToggle
            label="Google Search visibility"
            hint="site: query via search API"
            checked={useSearch}
            onChange={setUseSearch}
          />
        </div>
      </form>

      {run.isPending && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Gathering signals…
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SourceCard
              name="Sitemap estimate"
              enabled={result.sources.sitemap.enabled}
              available={result.sources.sitemap.available}
              meta={`${result.sources.sitemap.urlsFound} URLs discovered`}
            />
            <SourceCard
              name="Search visibility"
              enabled={result.sources.search.enabled}
              available={result.sources.search.available}
              meta={`${result.sources.search.resultsFound} results · query: ${result.sources.search.query}`}
            />
          </div>

          <SocialProfiles socials={result.socials ?? []} />

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-start gap-2 p-4 border-b border-border bg-muted/30 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Traffic share is a modeled estimate, not measured. Confidence is <b>high</b> when
                both sources agree on a page, <b>medium</b> for search-only, <b>low</b> for
                structural-only.
              </span>
            </div>
            {result.pages.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No pages found. Try enabling both sources or a different URL.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="text-left px-4 py-3 w-10">#</th>
                    <th className="text-left px-4 py-3">Page</th>
                    <th className="text-left px-4 py-3">Sources</th>
                    <th className="text-right px-4 py-3">Est. share</th>
                    <th className="text-left px-4 py-3">Confidence</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {result.pages.map((p, i) => (
                    <tr key={p.path} className="border-t border-border">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div
                          className="font-medium truncate max-w-[420px]"
                          title={p.title || p.path}
                        >
                          {p.title || p.path}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[420px]">
                          {p.path}
                        </div>
                        {p.citations && p.citations.length > 0 && (
                          <details className="mt-2 group">
                            <summary className="text-[11px] text-vine cursor-pointer hover:underline select-none">
                              {p.citations.length} citation{p.citations.length === 1 ? "" : "s"} ·
                              verify
                            </summary>
                            <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground border-l border-border pl-3">
                              {p.citations.map((c, ci) => (
                                <li key={ci} className="break-all">
                                  {c.source === "sitemap" ? (
                                    <>
                                      <span className="uppercase tracking-widest text-[10px] mr-1 text-foreground">
                                        sitemap
                                      </span>
                                      position {c.position}/{c.totalUrls} in{" "}
                                      <a
                                        href={c.sitemapUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-vine hover:underline inline-flex items-center gap-1"
                                      >
                                        {c.sitemapUrl}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </>
                                  ) : (
                                    <>
                                      <span className="uppercase tracking-widest text-[10px] mr-1 text-foreground">
                                        search
                                      </span>
                                      result #{c.position} for query{" "}
                                      <code className="px-1 py-0.5 rounded bg-muted text-foreground">
                                        {c.query}
                                      </code>{" "}
                                      via{" "}
                                      <code className="px-1 py-0.5 rounded bg-muted">
                                        {c.endpoint}
                                      </code>
                                      <div className="mt-0.5">
                                        →{" "}
                                        <a
                                          href={c.resultUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-vine hover:underline inline-flex items-center gap-1"
                                        >
                                          {c.resultUrl}
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.sources.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{p.estTrafficShare}%</td>
                      <td className="px-4 py-3">
                        <ConfBadge level={p.confidence} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-vine text-xs hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex-1 min-w-[260px] cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition ${
        checked ? "border-vine bg-vine/5" : "border-border bg-background hover:border-vine/50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[color:var(--color-vine,#22c55e)]"
      />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </label>
  );
}

function SourceCard({
  name,
  enabled,
  available,
  meta,
}: {
  name: string;
  enabled: boolean;
  available: boolean;
  meta: string;
}) {
  const status = !enabled ? "Disabled" : available ? "Active" : "No data";
  const cls = !enabled
    ? "text-muted-foreground"
    : available
      ? "text-emerald-500"
      : "text-amber-500";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{name}</div>
      <div className={`text-lg font-medium mt-1 ${cls}`}>{status}</div>
      <div className="text-xs text-muted-foreground mt-1">{meta}</div>
    </div>
  );
}

type Social = {
  platform: "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "youtube";
  url: string;
  handle?: string;
  foundOn: string;
};

const PLATFORMS: {
  key: Social["platform"];
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { key: "facebook", label: "Facebook", Icon: Facebook, color: "text-[#1877F2]" },
  { key: "instagram", label: "Instagram", Icon: Instagram, color: "text-[#E4405F]" },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin, color: "text-[#0A66C2]" },
  { key: "twitter", label: "Twitter / X", Icon: Twitter, color: "text-foreground" },
  { key: "tiktok", label: "TikTok", Icon: Music2, color: "text-foreground" },
  { key: "youtube", label: "YouTube", Icon: Youtube, color: "text-[#FF0000]" },
];

function SocialProfiles({ socials }: { socials: Social[] }) {
  const map = new Map(socials.map((s) => [s.platform, s]));
  const foundCount = socials.length;
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div>
          <div className="text-sm font-medium">Social profiles</div>
          <div className="text-xs text-muted-foreground">
            Detected by scanning the homepage and common contact/about pages for outbound links.
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {foundCount}/{PLATFORMS.length} found
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {PLATFORMS.map(({ key, label, Icon, color }) => {
          const hit = map.get(key);
          return (
            <div
              key={key}
              className={`rounded-xl border p-3 flex items-start gap-3 ${
                hit ? "border-border bg-background" : "border-dashed border-border bg-muted/20"
              }`}
            >
              <Icon
                className={`h-5 w-5 mt-0.5 shrink-0 ${hit ? color : "text-muted-foreground"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{label}</div>
                {hit ? (
                  <>
                    <a
                      href={hit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-vine hover:underline inline-flex items-center gap-1 break-all"
                    >
                      {hit.handle ? `@${hit.handle.replace(/^@/, "")}` : hit.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <div
                      className="text-[11px] text-muted-foreground mt-1 truncate"
                      title={hit.foundOn}
                    >
                      found on {hit.foundOn}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">Not detected</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
