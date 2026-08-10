import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { auditSite } from "@/lib/leadvine/audit.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink } from "lucide-react";
import { ScoreBadge } from "./app.index";

export const Route = createFileRoute("/_authenticated/app/audit-sites")({
  head: () => ({ meta: [{ title: "Audit sites — LeadVine" }] }),
  component: AuditSites,
});

function AuditSites() {
  const [urls, setUrls] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const auditFn = useServerFn(auditSite);
  const qc = useQueryClient();

  const { data: audits } = useQuery({
    queryKey: ["site-audits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_audits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const runBatch = async () => {
    const list = urls
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter(Boolean)
      .map((u) => (u.startsWith("http") ? u : `https://${u}`));
    if (list.length === 0) return toast.error("Enter at least one URL");
    setRunning(true);
    setProgress({ done: 0, total: list.length });
    let ok = 0;
    for (const url of list) {
      try {
        await auditFn({ data: { url } });
        ok++;
      } catch (e) {
        toast.error(`${url}: ${e instanceof Error ? e.message : "failed"}`);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setRunning(false);
    setUrls("");
    qc.invalidateQueries({ queryKey: ["site-audits"] });
    toast.success(`Audited ${ok}/${list.length} sites`);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Tool</div>
        <h1 className="font-display text-4xl mb-2">Audit sites</h1>
        <p className="text-muted-foreground">
          Paste URLs (one per line). We'll score each for redesign potential.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mb-8">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={5}
          placeholder="example.com&#10;anotherbusiness.com/&#10;third-site.com"
          className="w-full bg-background border border-border rounded-md p-3 text-sm outline-none focus:border-vine font-mono"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            {running
              ? `Auditing ${progress.done}/${progress.total}…`
              : `${urls.split(/[\s,]+/).filter(Boolean).length} URLs ready`}
          </div>
          <button
            onClick={runBatch}
            disabled={running}
            className="bg-vine text-primary-foreground rounded-md py-2 px-6 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {running && <Loader2 className="h-4 w-4 animate-spin" />}
            Run audit
          </button>
        </div>
      </div>

      <h2 className="font-display text-xl mb-4">Recent audits</h2>
      <div className="grid gap-3">
        {audits?.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm hover:text-vine flex items-center gap-1 truncate"
                >
                  {a.url} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(a.created_at).toLocaleString()}
                </div>
                {a.error ? (
                  <div className="text-xs text-red-400 mt-2">Error: {a.error}</div>
                ) : (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    {a.signals &&
                      Object.entries(a.signals as Record<string, unknown>)
                        .slice(0, 8)
                        .map(([k, v]) => (
                          <span key={k}>
                            <span className="text-foreground/70">{k.replace(/_/g, " ")}:</span>{" "}
                            {typeof v === "boolean" ? (v ? "✓" : "✗") : String(v).slice(0, 40)}
                          </span>
                        ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {a.score != null && <ScoreBadge score={a.score} />}
                {a.needs_redesign && (
                  <span className="text-[10px] uppercase tracking-wider bg-bordeaux/40 text-cream px-2 py-0.5 rounded-full">
                    Needs redesign
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {audits && audits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No audits yet.</p>
        )}
      </div>
    </div>
  );
}
