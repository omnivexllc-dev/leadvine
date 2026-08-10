import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  startScanBatch,
  processScanBatchChunk,
  cancelScanBatch,
} from "@/lib/leadvine/scan.functions";
import { toast } from "sonner";
import { Loader2, Radar, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/bulk-scan")({
  head: () => ({
    meta: [
      { title: "Bulk AI website scanner — LeadVine" },
      {
        name: "description",
        content:
          "Scan every saved lead's website in bulk, score site quality and SEO in one pass, and re-rank opportunities automatically.",
      },
      { property: "og:title", content: "Bulk AI website scanner — LeadVine" },
      {
        property: "og:description",
        content: "Scan every saved lead's website in bulk and re-rank opportunities automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BulkScan,
});

type Batch = {
  id: string;
  total: number;
  completed: number;
  skipped: number;
  failed: number;
  cursor: number;
  status: string;
};

type ResultRow = { id: string; name: string; outcome: string; detail?: string };

function BulkScan() {
  const [listId, setListId] = useState<string>("");
  const [forceRescan, setForceRescan] = useState(false);
  const [rescanDays, setRescanDays] = useState(30);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);

  const startFn = useServerFn(startScanBatch);
  const chunkFn = useServerFn(processScanBatchChunk);
  const cancelFn = useServerFn(cancelScanBatch);

  const { data: lists } = useQuery({
    queryKey: ["lead-lists"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lead_lists")
        .select("id, name")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const run = async () => {
    cancelled.current = false;
    setResults([]);
    setRunning(true);
    try {
      const started = (await startFn({
        data: { listId: listId || null, forceRescan, rescanDays },
      })) as Batch;
      setBatch(started);

      if (started.total === 0) {
        toast.info("No leads with a website found for that selection");
        setRunning(false);
        return;
      }

      let current = started;
      while (current.status === "running" && !cancelled.current) {
        const res = (await chunkFn({ data: { batchId: current.id, chunkSize: 5 } })) as {
          batch: Batch;
          results: ResultRow[];
        };
        current = res.batch;
        setBatch(res.batch);
        setResults((r) => [...res.results, ...r]);
      }

      if (cancelled.current) toast.info("Scan cancelled");
      else
        toast.success(
          `Scan finished — ${current.completed} scanned, ${current.skipped} skipped, ${current.failed} failed`,
        );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setRunning(false);
    }
  };

  const stop = async () => {
    cancelled.current = true;
    if (batch) {
      try {
        await cancelFn({ data: { batchId: batch.id } });
      } catch {
        /* the loop stops regardless */
      }
    }
  };

  const processed = batch ? batch.completed + batch.skipped + batch.failed : 0;
  const pct = batch && batch.total ? Math.round((processed / batch.total) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Tool</div>
        <h1 className="font-display text-4xl mb-2">Bulk AI website scanner</h1>
        <p className="text-muted-foreground max-w-2xl">
          Scans every saved lead that has a website — one page fetch per site, scored for both
          redesign potential and SEO, then re-ranked by Opportunity Score. Keep this tab open while
          it runs; the scan is driven from here in small chunks so it never hits a request timeout.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="block mb-1.5 text-muted-foreground">Lead list</span>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All leads</option>
              {(lists ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1.5 text-muted-foreground">
              Skip if scanned within (days)
            </span>
            <input
              type="number"
              min={1}
              max={365}
              value={rescanDays}
              disabled={forceRescan}
              onChange={(e) => setRescanDays(Number(e.target.value) || 30)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
            />
          </label>
          <label className="text-sm flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={forceRescan}
              onChange={(e) => setForceRescan(e.target.checked)}
            />
            <span>Force rescan everything</span>
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-md bg-vine px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            {running ? "Scanning…" : "Start scan"}
          </button>
          {running && (
            <button onClick={stop} className="rounded-md border border-border px-4 py-2 text-sm">
              Stop
            </button>
          )}
        </div>

        {batch && (
          <div className="mt-6">
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-vine transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {processed}/{batch.total} processed · {batch.completed} scanned · {batch.skipped}{" "}
              skipped · {batch.failed} failed
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-sm text-muted-foreground">
            Scan log
          </div>
          <ul className="divide-y divide-border max-h-[28rem] overflow-auto">
            {results.map((r, i) => (
              <li key={`${r.id}-${i}`} className="flex items-start gap-3 px-5 py-3 text-sm">
                {r.outcome === "scanned" ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-vine shrink-0" />
                ) : r.outcome === "skipped" ? (
                  <MinusCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="truncate">{r.name}</div>
                  {r.detail && (
                    <div className="text-xs text-muted-foreground truncate">{r.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
