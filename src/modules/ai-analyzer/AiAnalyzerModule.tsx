import { useState } from "react";
import { generateAiWebsiteAudit } from "../opportunity-engine/opportunityEngine.service";
import { AiWebsiteAudit } from "../types";
import {
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Layout,
  Type,
  Smartphone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export function AiAnalyzerModule() {
  const [urlInput, setUrlInput] = useState<string>("apexplumbingdemo.com");
  const [businessName, setBusinessName] = useState<string>("Apex Plumbing");
  const [audit, setAudit] = useState<AiWebsiteAudit>(
    generateAiWebsiteAudit("apexplumbingdemo.com", "Apex Plumbing"),
  );

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAudit(generateAiWebsiteAudit(urlInput, businessName || "Prospect Business"));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 5</div>
        <h1 className="font-display text-3xl font-bold mb-2">AI Website Analyzer</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Detailed structural audit of Homepage, Hero, Navigation, Typography, Spacing, Buttons/CTA,
          Footer, Forms, Trust Signals, and Mobile UX.
        </p>
      </div>

      <form
        onSubmit={handleRunAudit}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-3"
      >
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business Name e.g. Apex Plumbing"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Website URL e.g. apexplumbingdemo.com"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Run AI Audit
        </button>
      </form>

      {/* Audit Summary Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono uppercase">
              AI Audit Target
            </span>
            <h2 className="text-2xl font-bold font-display">{audit.businessName}</h2>
            <p className="text-xs font-mono text-vine">{audit.url}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-mono block">Opportunity Score</span>
            <span className="text-3xl font-bold font-mono text-vine">
              {audit.overallScore} / 100
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 text-xs text-foreground leading-relaxed border border-border/60">
          <span className="font-semibold text-vine block mb-1">AI Diagnostic Summary:</span>
          {audit.summary}
        </div>
      </div>

      {/* Audit Section Breakdown Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <AuditSectionCard
          section={audit.homepage}
          icon={<Layout className="h-4 w-4 text-vine" />}
        />
        <AuditSectionCard
          section={audit.heroSection}
          icon={<Sparkles className="h-4 w-4 text-vine" />}
        />
        <AuditSectionCard
          section={audit.typography}
          icon={<Type className="h-4 w-4 text-vine" />}
        />
        <AuditSectionCard
          section={audit.callToAction}
          icon={<ArrowRight className="h-4 w-4 text-vine" />}
        />
        <AuditSectionCard
          section={audit.mobileUx}
          icon={<Smartphone className="h-4 w-4 text-vine" />}
        />
        <AuditSectionCard
          section={audit.footerAndTrust}
          icon={<ShieldCheck className="h-4 w-4 text-vine" />}
        />
      </div>
    </div>
  );
}

function AuditSectionCard({
  section,
  icon,
}: {
  section: AiWebsiteAudit["homepage"];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          {icon} {section.name}
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            section.status === "critical"
              ? "bg-rose-500/20 text-rose-400"
              : section.status === "warning"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {section.score} / 100 ({section.status})
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{section.details}</p>

      <div className="space-y-1 pt-1">
        <span className="text-[11px] font-semibold text-vine block">
          Agency Pitch Recommendations:
        </span>
        <ul className="text-xs space-y-1 list-disc list-inside text-foreground/90">
          {section.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
