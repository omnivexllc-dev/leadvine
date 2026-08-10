import { useState } from "react";
import { detectWebsiteTechnologyStack } from "./techDetector.service";
import { TechStackDetection } from "../types";
import { Cpu, Search, Layers, AlertTriangle, CheckCircle, BarChart3, Code } from "lucide-react";

export function TechDetectorModule() {
  const [targetUrl, setTargetUrl] = useState<string>("apexplumbingdemo.com");
  const [tech, setTech] = useState<TechStackDetection>(
    detectWebsiteTechnologyStack("apexplumbingdemo.com"),
  );

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    setTech(detectWebsiteTechnologyStack(targetUrl));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 4</div>
        <h1 className="font-display text-3xl font-bold mb-2">Website Technology Detector</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Fingerprints CMS engines, frontend frameworks, analytics telemetry, marketing pixels, and
          infrastructure. Identifies outdated legacy tech stack risks.
        </p>
      </div>

      <form
        onSubmit={handleScan}
        className="rounded-xl border border-border bg-card p-4 flex gap-3"
      >
        <div className="relative flex-1">
          <Cpu className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="Enter website URL e.g. metrobistronew.com"
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Search className="h-4 w-4" /> Detect Tech Stack
        </button>
      </form>

      {/* Tech Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Primary CMS Engine
          </div>
          <div className="text-xl font-bold text-vine font-mono">{tech.cms}</div>
          <div className="text-xs text-muted-foreground">Version: {tech.cmsVersion}</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Tech Modernity Grade
          </div>
          <div
            className={`text-2xl font-bold font-mono ${tech.score < 60 ? "text-rose-400" : "text-emerald-400"}`}
          >
            {tech.score} / 100
          </div>
          <div className="text-xs text-muted-foreground">
            {tech.outdatedFlags.length} Outdated Flags Found
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Analytics Telemetry
          </div>
          <div className="text-sm font-semibold font-mono">
            {tech.analytics.join(", ") || "None Detected"}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="text-xs text-muted-foreground font-mono uppercase">Infrastructure</div>
          <div className="text-sm font-semibold font-mono">{tech.infrastructure.join(", ")}</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-vine" /> Detected Software Stack
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold block mb-1 text-muted-foreground">
                Frontend Libraries & Frameworks
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tech.frameworks.map((f, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-secondary text-foreground font-mono"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold block mb-1 text-muted-foreground">
                Marketing & Ad Pixels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tech.marketingPixels.length > 0 ? (
                  tech.marketingPixels.map((p, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-secondary text-foreground font-mono"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">No marketing pixels detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Outdated Flags for Agency Sales Pitch */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Legacy & Vulnerability Sales Pitch Flags
          </h3>
          <div className="space-y-2">
            {tech.outdatedFlags.length > 0 ? (
              tech.outdatedFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Modern, fully up-to-date technology stack detected.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
