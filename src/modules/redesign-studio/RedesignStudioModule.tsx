import { useState } from "react";
import { generateRedesignProposal, ExtendedRedesignProposal } from "./redesignStudio.service";
import {
  Palette,
  Layout,
  Type,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Split,
  DollarSign,
  Clock,
  Mail,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Layers,
  ArrowUpRight,
  Smartphone,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";

export function RedesignStudioModule() {
  const [businessName, setBusinessName] = useState<string>("Sunstate Dental");
  const [urlInput, setUrlInput] = useState<string>("sunstatedental.com");
  const [proposal, setProposal] = useState<ExtendedRedesignProposal>(
    generateRedesignProposal("Sunstate Dental", "sunstatedental.com"),
  );

  const [activeTab, setActiveTab] = useState<
    "before_after" | "concept" | "pricing" | "email" | "proposal"
  >("before_after");

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [splitPosition, setSplitPosition] = useState<number>(50);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    setProposal(generateRedesignProposal(businessName, urlInput));
    toast.success(`Generated AI Redesign Simulator wireframe for ${businessName}!`);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(
      `Subject: ${proposal.generatedOutreachEmail.subject}\n\n${proposal.generatedOutreachEmail.body}`,
    );
    setCopiedEmail(true);
    toast.success("Outreach email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposal.generatedProposalText);
    setCopiedProposal(true);
    toast.success("Proposal text copied to clipboard!");
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-vine mb-1">Module 7</div>
          <h1 className="font-display text-3xl font-bold mb-1">AI Website Redesign Simulator</h1>
          <p className="text-muted-foreground text-sm max-w-3xl">
            Simulates a modern website transformation: analyzes existing site flaws, generates a
            brand-new homepage concept, displays interactive Before vs. After comparison, calculates
            agency project costs & timelines, and crafts high-converting proposals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-vine/10 border border-vine/20 px-3 py-1 text-xs font-semibold text-vine">
            <Sparkles className="h-3.5 w-3.5" /> AI Wireframe Engine Active
          </span>
        </div>
      </div>

      {/* Generator Form Input */}
      <form
        onSubmit={handleGenerate}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-3 shadow-sm"
      >
        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Target Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sunstate Dental"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-vine focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
            Current Website URL
          </label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="e.g. sunstatedental.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-vine focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-md"
          >
            <Sparkles className="h-4 w-4" /> Simulate Redesign
          </button>
        </div>
      </form>

      {/* Simulator Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-1">
        {[
          { id: "before_after", label: "Before vs. After Preview", icon: Split },
          { id: "concept", label: "Homepage Wireframe Concept", icon: Layout },
          { id: "pricing", label: "Cost & Timeline Estimator", icon: DollarSign },
          { id: "email", label: "Personalized Outreach Email", icon: Mail },
          { id: "proposal", label: "Executive Proposal", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as "before_after" | "concept" | "pricing" | "email" | "proposal",
                )
              }
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "border-vine text-vine bg-vine/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BEFORE VS AFTER SIMULATOR */}
      {activeTab === "before_after" && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-1">
              <div className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Existing Site Mobile Score
              </div>
              <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                {proposal.beforeWebsiteState.mobileScore} / 100
              </div>
              <p className="text-[11px] text-muted-foreground">
                High friction & slow mobile page speed
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Projected AI Redesign Impact
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {proposal.afterWebsiteState.expectedConversionBoost}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Load time: {proposal.afterWebsiteState.expectedLoadTimeSeconds}
              </p>
            </div>

            <div className="rounded-xl border border-vine/30 bg-vine/5 p-4 space-y-1">
              <div className="text-[11px] font-semibold text-vine uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Recommended Project Scope
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">
                $4,500 <span className="text-xs font-normal text-muted-foreground">(3 Weeks)</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Growth & Lead Machine Package</p>
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BEFORE CARD */}
            <div className="rounded-2xl border border-red-500/30 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                    CURRENT WEBSITE (BEFORE)
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {proposal.websiteUrl}
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Mockup Frame */}
                <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-4 font-mono text-xs text-muted-foreground">
                  <div className="border-b border-border/80 pb-2 flex items-center justify-between">
                    <span className="text-red-500 font-semibold">[!] Outdated Header Layout</span>
                    <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded">
                      Slow 4.8s
                    </span>
                  </div>

                  <div className="space-y-2 opacity-80">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                    <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
                    <div className="h-20 bg-muted/60 rounded border border-dashed border-red-400/40 p-3 text-[11px]">
                      Non-responsive hero block with missing CTA button and small illegible font
                      size on mobile screen...
                    </div>
                  </div>
                </div>

                {/* Audit Flaws List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Core Friction Points Identified:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {proposal.beforeWebsiteState.coreIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 shrink-0 font-bold">✕</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AFTER CARD */}
            <div className="rounded-2xl border border-emerald-500/30 bg-card overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    AI REDESIGN CONCEPT (AFTER)
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> High Conversion
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Modern Hero Preview Frame */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    ★ 5.0 Rated Local Business
                  </span>
                  <h3 className="text-lg font-bold font-display text-foreground leading-snug">
                    {proposal.heroHeadline}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {proposal.heroSubtitle}
                  </p>
                  <button className="px-5 py-2.5 rounded-lg bg-vine text-background text-xs font-bold shadow-md hover:opacity-90 transition-all">
                    {proposal.primaryCtaText} →
                  </button>
                </div>

                {/* Highlights List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Key Redesign Upgrades:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {proposal.afterWebsiteState.keyHighlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Split Slider Control */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Split className="h-4 w-4 text-vine" /> Interactive Before / After Split Ratio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjust the split slider to visualize relative impact when pitching to client
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-vine bg-vine/10 px-3 py-1 rounded-full">
                {splitPosition}% After Concept
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="90"
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="w-full accent-vine cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 2: HOMEPAGE CONCEPT */}
      {activeTab === "concept" && (
        <div className="space-y-8">
          {/* Wireframe Hero Mockup Preview */}
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <span className="text-xs text-muted-foreground font-mono uppercase">
                  AI Generated Concept Wireframe
                </span>
                <h2 className="text-2xl font-bold font-display">{proposal.leadName}</h2>
              </div>
              <button
                onClick={() => toast.success("Redesign wireframe saved to Pitch Assets!")}
                className="text-xs bg-vine text-background px-4 py-2 rounded-lg font-semibold hover:opacity-90"
              >
                Save Pitch Concept
              </button>
            </div>

            {/* Hero Section Wireframe Card */}
            <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center space-y-4 max-w-2xl mx-auto">
              <div className="text-xs uppercase tracking-widest text-vine font-mono font-semibold">
                Hero Section Proposal
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground leading-tight">
                {proposal.heroHeadline}
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                {proposal.heroSubtitle}
              </p>
              <div>
                <span className="inline-block px-6 py-3 rounded-lg bg-vine text-background text-sm font-bold shadow-lg">
                  {proposal.primaryCtaText} →
                </span>
              </div>
            </div>
          </div>

          {/* Color Palette & Typography */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-vine" /> Recommended Color Palette
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {proposal.suggestedColorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-background space-y-2"
                  >
                    <div className="h-8 w-full rounded-md" style={{ backgroundColor: color.hex }} />
                    <div className="text-xs font-semibold">{color.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {color.hex} · {color.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Type className="h-4 w-4 text-vine" /> Typography Hierarchy
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/60">
                  <span className="text-muted-foreground block font-mono">Headings:</span>
                  <span className="font-bold text-sm text-foreground">
                    {proposal.suggestedTypography.displayFont}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/60">
                  <span className="text-muted-foreground block font-mono">Body & UI Text:</span>
                  <span className="font-bold text-sm text-foreground">
                    {proposal.suggestedTypography.bodyFont}
                  </span>
                </div>
                <p className="text-muted-foreground italic">
                  {proposal.suggestedTypography.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Layout Structure */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-vine" /> Recommended Wireframe Page Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {proposal.layoutStructure.map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-1"
                >
                  <div className="text-xs font-bold text-vine">{sec.section}</div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {sec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COST & TIMELINE ESTIMATOR */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold font-display">
              Estimated Agency Scope, Pricing & Timelines
            </h2>
            <p className="text-xs text-muted-foreground">
              Select an agency package tier to include directly in your pitch proposal to{" "}
              <span className="font-semibold text-foreground">{proposal.leadName}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proposal.costEstimates.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 flex flex-col justify-between space-y-6 transition-all ${
                  tier.recommended
                    ? "border-vine bg-vine/5 shadow-md relative"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vine text-background text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    ★ Most Popular Choice
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{tier.tier}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-mono text-foreground">
                        ${tier.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">one-time</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-vine bg-vine/10 px-3 py-1.5 rounded-lg w-fit">
                    <Clock className="h-3.5 w-3.5" />
                    Estimated Timeline: {tier.timelineWeeks} Weeks
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Included Deliverables:
                    </span>
                    <ul className="space-y-1.5 text-xs">
                      {tier.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-vine shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() =>
                    toast.success(`Selected ${tier.tier} package ($${tier.price}) for proposal!`)
                  }
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                    tier.recommended
                      ? "bg-vine text-background hover:opacity-90"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Select Package Tier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERSONALIZED OUTREACH EMAIL */}
      {activeTab === "email" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-vine" /> AI Generated Redesign Outreach Email
                </h3>
                <p className="text-xs text-muted-foreground">
                  Personalized cold email pitch linking directly to this Before vs. After Redesign
                  Simulator concept.
                </p>
              </div>

              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 rounded-lg bg-vine px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-all"
              >
                {copiedEmail ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedEmail ? "Copied!" : "Copy Email"}
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-lg bg-muted/40 p-3 border border-border">
                <span className="text-muted-foreground font-semibold">Subject:</span>{" "}
                <span className="text-foreground font-bold">
                  {proposal.generatedOutreachEmail.subject}
                </span>
              </div>

              <div className="rounded-lg bg-muted/30 p-4 border border-border whitespace-pre-wrap leading-relaxed text-foreground">
                {proposal.generatedOutreachEmail.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXECUTIVE PROPOSAL */}
      {activeTab === "proposal" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-vine" /> Executive Redesign Proposal Brief
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ready-to-send proposal text including audit findings, deliverables, and ROI
                  forecast.
                </p>
              </div>

              <button
                onClick={handleCopyProposal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-vine px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-all"
              >
                {copiedProposal ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedProposal ? "Copied!" : "Copy Proposal Text"}
              </button>
            </div>

            <pre className="rounded-lg bg-muted/30 p-5 border border-border font-mono text-xs whitespace-pre-wrap text-foreground leading-relaxed">
              {proposal.generatedProposalText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
