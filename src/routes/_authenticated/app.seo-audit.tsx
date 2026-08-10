import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { auditSeo } from "@/lib/leadvine/audit.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Printer } from "lucide-react";
import { ScoreBadge } from "./app.index";

export const Route = createFileRoute("/_authenticated/app/seo-audit")({
  head: () => ({ meta: [{ title: "SEO audit — LeadVine" }] }),
  component: SeoAudit,
});

function SeoAudit() {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const seoFn = useServerFn(auditSeo);
  const qc = useQueryClient();

  const { data: reports } = useQuery({
    queryKey: ["seo-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      const u = url.startsWith("http") ? url : `https://${url}`;
      return seoFn({ data: { url: u } });
    },
    onSuccess: (row) => {
      toast.success("Report ready");
      setUrl("");
      setSelected(row.id);
      qc.invalidateQueries({ queryKey: ["seo-reports"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Audit failed"),
  });

  const active = reports?.find((r) => r.id === selected) ?? reports?.[0];

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Tool</div>
        <h1 className="font-display text-4xl mb-2">SEO audit</h1>
        <p className="text-muted-foreground">
          Enter a URL to generate an on-page SEO report with prioritized recommendations.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run.mutate();
        }}
        className="rounded-2xl border border-border bg-card p-5 flex gap-3 mb-8"
      >
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
          Audit
        </button>
      </form>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            History
          </div>
          {reports?.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 ${
                active?.id === r.id
                  ? "border-vine bg-vine/5"
                  : "border-border bg-card hover:border-vine/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm truncate">{r.url}</div>
                <ScoreBadge score={r.score ?? 0} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
          {reports && reports.length === 0 && (
            <p className="text-xs text-muted-foreground">No reports yet.</p>
          )}
        </div>

        {active && <SeoReport report={active} />}
      </div>
    </div>
  );
}

function SeoReport({
  report,
}: {
  report: {
    url: string;
    created_at: string;
    data?: unknown;
    recommendations?: { level: string; msg: string }[];
  };
}) {
  const d = (report.data ?? {}) as Record<string, unknown>;
  const recs = (report.recommendations ?? []) as { level: string; msg: string }[];
  return (
    <div className="rounded-2xl border border-border bg-card p-6 print:border-0 print:bg-white print:text-black">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-vine mb-1">SEO report</div>
          <h2 className="font-display text-2xl break-all">{report.url}</h2>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(report.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBadge score={report.score ?? 0} />
          <button
            onClick={() => window.print()}
            className="text-xs border border-border rounded-md px-3 py-1.5 flex items-center gap-1 hover:bg-secondary"
          >
            <Printer className="h-3 w-3" /> Print
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Info label="Title" value={report.title || "—"} />
        <Info label="Meta description" value={report.description || "—"} />
        <Info label="H1" value={(d.h1s ?? []).join(" • ") || "—"} />
        <Info label="Canonical" value={d.canonical || "—"} />
        <Info label="OG image" value={d.og_image || "—"} />
        <Info label="Word count" value={String(d.word_count ?? "—")} />
        <Info
          label="Images with alt"
          value={`${d.images_with_alt ?? 0} / ${d.images_total ?? 0} (${d.alt_coverage ?? 0}%)`}
        />
        <Info
          label="Links"
          value={`${d.internal_links ?? 0} internal · ${d.external_links ?? 0} external`}
        />
      </div>

      <div>
        <h3 className="font-display text-lg mb-3">Recommendations</h3>
        {recs.length === 0 ? (
          <p className="text-sm text-vine">Nothing critical — great work!</p>
        ) : (
          <ul className="space-y-2">
            {recs.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span
                  className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded h-fit mt-0.5 ${r.level === "high" ? "bg-red-400/20 text-red-300" : r.level === "med" ? "bg-yellow-400/20 text-yellow-300" : "bg-muted text-muted-foreground"}`}
                >
                  {r.level}
                </span>
                <span>{r.msg}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm break-words">{value}</div>
    </div>
  );
}
