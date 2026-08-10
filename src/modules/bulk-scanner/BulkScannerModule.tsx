import { useState } from "react";
import { scanSingleWebsiteSimulated, BulkScanCheckResult } from "./bulkScanner.service";
import {
  Radar,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Zap,
  Globe,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export function BulkScannerModule() {
  const [targetBatchSize, setTargetBatchSize] = useState<number>(100);
  const [forceRescan, setForceRescan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResults, setScanResults] = useState<BulkScanCheckResult[]>([]);

  const handleStartBulkScan = () => {
    setIsScanning(true);
    setProgress(0);
    setScanResults([]);

    const mockLeads = Array.from({ length: targetBatchSize }).map((_, i) => ({
      name: `Prospect Business #${i + 1}`,
      url: `https://business${i + 1}example.com`,
    }));

    let index = 0;
    const interval = setInterval(() => {
      if (index >= mockLeads.length) {
        clearInterval(interval);
        setIsScanning(false);
        setProgress(100);
        toast.success(`Completed bulk scan of ${targetBatchSize} websites!`);
        return;
      }

      const item = mockLeads[index];
      const res = scanSingleWebsiteSimulated(item.url, item.name, forceRescan);
      setScanResults((prev) => [res, ...prev]);
      index++;
      setProgress(Math.round((index / mockLeads.length) * 100));
    }, 50);
  };

  const highOpportunityCount = scanResults.filter((r) => r.redesignOpportunity === "High").length;
  const downCount = scanResults.filter((r) => !r.isLive).length;
  const sslIssuesCount = scanResults.filter((r) => r.isLive && !r.sslValid).length;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 2</div>
        <h1 className="font-display text-3xl font-bold mb-2">Bulk AI Website Scanner</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Scale website audits from 100 to 10,000 domains. Evaluates uptime, SSL, DNS speed,
          Performance, Accessibility, SEO, Security, Branding, CTA, and Mobile UX.
        </p>
      </div>

      {/* Control Panel */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Batch Size Preset</label>
            <select
              value={targetBatchSize}
              onChange={(e) => setTargetBatchSize(Number(e.target.value))}
              disabled={isScanning}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium"
            >
              <option value={100}>100 Websites</option>
              <option value={500}>500 Websites</option>
              <option value={1000}>1,000 Websites</option>
              <option value={5000}>5,000 Websites</option>
              <option value={10000}>10,000 Websites</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Rescan Policy</label>
            <label className="flex items-center gap-2 mt-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={forceRescan}
                onChange={(e) => setForceRescan(e.target.checked)}
                disabled={isScanning}
              />
              <span>Force refresh cached scan results</span>
            </label>
          </div>

          <div className="md:col-span-2 flex items-end gap-3">
            {!isScanning ? (
              <button
                onClick={handleStartBulkScan}
                className="inline-flex items-center gap-2 rounded-lg bg-vine px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                <Play className="h-4 w-4" /> Start Bulk AI Scan ({targetBatchSize})
              </button>
            ) : (
              <button
                onClick={() => setIsScanning(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                <Pause className="h-4 w-4" /> Pause Scan Process
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(isScanning || progress > 0) && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>Scanning Progress: {progress}%</span>
              <span>
                {scanResults.length} / {targetBatchSize} Processed
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-vine transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {scanResults.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-vine/10 text-vine">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono">{scanResults.length}</div>
              <div className="text-xs text-muted-foreground">Total Websites Scanned</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {highOpportunityCount}
              </div>
              <div className="text-xs text-muted-foreground">High Redesign Prospects</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-rose-400">{downCount}</div>
              <div className="text-xs text-muted-foreground">Sites Down / Unreachable</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-amber-400">{sslIssuesCount}</div>
              <div className="text-xs text-muted-foreground">SSL / Security Issues</div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Websites Table */}
      {scanResults.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-vine" /> Real-time Diagnostic Matrix
            </h3>
            <button
              onClick={() => toast.success("Exported Bulk Scan Results to CSV!")}
              className="text-xs text-vine hover:underline flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Export Scan Report (CSV)
            </button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/60 text-muted-foreground font-mono uppercase">
                <tr>
                  <th className="p-2.5">Business / URL</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">SSL</th>
                  <th className="p-2.5">Response</th>
                  <th className="p-2.5">Perf</th>
                  <th className="p-2.5">SEO</th>
                  <th className="p-2.5">CTA / Mobile</th>
                  <th className="p-2.5">Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scanResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-secondary/30">
                    <td className="p-2.5">
                      <div className="font-medium text-foreground">{r.businessName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{r.url}</div>
                    </td>
                    <td className="p-2.5">
                      {r.isLive ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                          HTTP {r.httpStatus}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px]">
                          DOWN ({r.httpStatus})
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {r.sslValid ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-rose-400" />
                      )}
                    </td>
                    <td className="p-2.5 font-mono">{r.isLive ? `${r.responseTimeMs} ms` : "—"}</td>
                    <td className="p-2.5 font-mono">{r.scores.performance}/100</td>
                    <td className="p-2.5 font-mono">{r.scores.seo}/100</td>
                    <td className="p-2.5 font-mono">
                      CTA: {r.scores.ctaPresence} | Mobile: {r.scores.mobileUx}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                          r.redesignOpportunity === "High"
                            ? "bg-vine text-background"
                            : r.redesignOpportunity === "Medium"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {r.redesignOpportunity} Redesign Potential
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
