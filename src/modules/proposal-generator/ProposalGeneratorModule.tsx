import { useState } from "react";
import { createProposalDocument } from "./proposalGenerator.service";
import { ProposalDocument } from "../types";
import { FileText, Download, Check, Sparkles, Printer, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function ProposalGeneratorModule() {
  const [clientName, setClientName] = useState<string>("Vanguard Law Group");
  const [websiteUrl, setWebsiteUrl] = useState<string>("vanguardlaw.co");
  const [prop, setProp] = useState<ProposalDocument>(
    createProposalDocument("Vanguard Law Group", "vanguardlaw.co"),
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setProp(createProposalDocument(clientName, websiteUrl));
    toast.success(`Generated Proposal Document for ${clientName}!`);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 12</div>
        <h1 className="font-display text-3xl font-bold mb-2">Proposal Generator</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Generates client proposals with audit summaries, problem highlights, proposed redesign
          scopes, timeline, and tiered pricing.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-3"
      >
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client / Prospect Name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="Website URL"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Generate Client Proposal
        </button>
      </form>

      {/* Proposal Document Preview */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-8 print:border-0 print:p-0">
        <div className="flex justify-between items-start border-b border-border pb-6">
          <div>
            <div className="text-xs font-mono text-vine font-semibold uppercase">
              Website Redesign & Growth Proposal
            </div>
            <h2 className="text-3xl font-bold font-display text-foreground mt-1">
              {prop.clientName}
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Prepared by {prop.agencyName} · Date: {prop.createdAt}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vine text-background text-xs font-bold hover:opacity-90 print:hidden"
          >
            <Printer className="h-4 w-4" /> Print / Export PDF
          </button>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase font-mono text-vine">1. Executive Summary</h3>
          <p className="text-xs text-foreground/90 leading-relaxed font-sans">
            {prop.auditSummary}
          </p>
        </div>

        {/* Problems & Solutions */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs">
            <h4 className="font-bold text-rose-300 font-mono">
              Current Site Bottlenecks Identified:
            </h4>
            <ul className="space-y-1 list-disc list-inside text-rose-200">
              {prop.identifiedProblems.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
            <h4 className="font-bold text-emerald-300 font-mono">
              Proposed Agency Redesign Solutions:
            </h4>
            <ul className="space-y-1 list-disc list-inside text-emerald-200">
              {prop.proposedSolutions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Investment Tiers */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase font-mono text-vine">
            2. Investment & Pricing Options
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {prop.investmentTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-6 space-y-4 flex flex-col justify-between ${
                  tier.recommended
                    ? "border-vine bg-vine/10 relative shadow-xl"
                    : "border-border bg-secondary/30"
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-3 left-4 bg-vine text-background font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    Most Popular
                  </span>
                )}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-foreground">{tier.tierName}</h4>
                  <div className="text-2xl font-bold font-mono text-vine">
                    ${tier.price.toLocaleString()}
                  </div>
                  <ul className="text-xs space-y-2 pt-2 text-foreground/90">
                    {tier.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-vine shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
