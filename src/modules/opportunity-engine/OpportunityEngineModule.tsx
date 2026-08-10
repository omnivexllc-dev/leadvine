import { useState } from "react";
import { calculateRedesignOpportunityScore } from "./opportunityEngine.service";
import { OpportunityScoreBreakdown } from "../types";
import { Star, Flame, Sparkles, CheckCircle2, Search, ArrowRight, Lightbulb } from "lucide-react";

export function OpportunityEngineModule() {
  const [businessName, setBusinessName] = useState<string>("Vanguard Law Group");
  const [urlInput, setUrlInput] = useState<string>("vanguardlaw.co");
  const [data, setData] = useState<OpportunityScoreBreakdown>(
    calculateRedesignOpportunityScore("vanguardlaw.co", "Vanguard Law Group"),
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setData(calculateRedesignOpportunityScore(urlInput, businessName || "Target Business"));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 6</div>
        <h1 className="font-display text-3xl font-bold mb-2">
          Website Redesign Opportunity Engine
        </h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          The core prospecting intelligence engine. Computes Design, SEO, Speed, Accessibility,
          Conversion, Trust, and Brand sub-scores to classify leads from ★★★★★ down to ★☆☆☆☆.
        </p>
      </div>

      <form
        onSubmit={handleCalculate}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-3"
      >
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business Name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Website URL"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Search className="h-4 w-4" /> Calculate Opportunity Score
        </button>
      </form>

      {/* Main Opportunity Badge Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/30 p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs text-muted-foreground font-mono uppercase">
              Target Business
            </span>
            <h2 className="text-3xl font-bold font-display text-foreground">{businessName}</h2>
            <p className="text-xs font-mono text-vine mt-0.5">{urlInput}</p>
          </div>

          <div className="text-right">
            <div className="text-2xl text-amber-400 font-mono tracking-wider">
              {data.classification.split(" ")[0]}
            </div>
            <div className="text-sm font-semibold text-vine">
              {data.classification.split(" ").slice(1).join(" ")}
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              Opportunity Score: {data.overallScore}/100
            </div>
          </div>
        </div>

        {/* AI Reasoning Box */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-vine uppercase font-mono">
            <Sparkles className="h-4 w-4" /> AI Redesign Pitch Reasoning
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed font-sans">{data.aiReasoning}</p>
        </div>
      </div>

      {/* Sub-scores 7-Metric Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreMeter label="Design Quality Score" value={data.designScore} />
        <ScoreMeter label="SEO & Search Rank" value={data.seoScore} />
        <ScoreMeter label="Mobile PageSpeed" value={data.performanceScore} />
        <ScoreMeter label="Accessibility & Contrast" value={data.accessibilityScore} />
        <ScoreMeter label="Conversion Rate (CRO)" value={data.conversionScore} />
        <ScoreMeter label="Trust Signals & Reviews" value={data.trustScore} />
        <ScoreMeter label="Brand Modernity" value={data.brandScore} />
        <ScoreMeter label="Overall Redesign Potential" value={data.overallScore} highlight />
      </div>

      {/* Pitch Angle Hook Recommendations */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-vine">
          <Lightbulb className="h-4 w-4" /> Recommended Pitch Angles for Cold Outreach
        </h3>
        <ul className="grid gap-3 md:grid-cols-2">
          {data.pitchAngles.map((angle, idx) => (
            <li
              key={idx}
              className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs flex items-start gap-2"
            >
              <ArrowRight className="h-3.5 w-3.5 text-vine shrink-0 mt-0.5" />
              <span>{angle}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ScoreMeter({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const color = value < 40 ? "bg-rose-500" : value < 70 ? "bg-amber-500" : "bg-vine";

  return (
    <div
      className={`rounded-xl border p-4 space-y-2 ${highlight ? "border-vine bg-vine/5" : "border-border bg-card"}`}
    >
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-mono font-bold text-foreground">{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
