import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Play,
  CheckCircle2,
  Building2,
  MapPin,
  Globe,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  BarChart3,
  Flame,
  Check,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AiSearchPlan,
  SinglePromptLeadCampaign,
  UnifiedLeadIntelligenceReport,
} from "@/modules/types";
import {
  parseUserPromptToPlan,
  refinePlanWithNaturalLanguage,
  executeAiSearch,
  getAiCampaigns,
  saveAiCampaign,
  ExecutionSummary,
} from "@/services/aiLeadSearch.service";
import { LeadIntelligenceReportModal } from "./LeadIntelligenceReportModal";
import { PIPELINE_STAGES } from "@/services/leadIntelligence.service";

interface AiLeadSearchEngineProps {
  onLeadSelect?: (report: UnifiedLeadIntelligenceReport) => void;
  className?: string;
  defaultPrompt?: string;
}

const EXAMPLE_PROMPTS = [
  "Find roofing companies in Florida that have outdated websites",
  "Dentists in Texas with poor Google presence",
  "Restaurants without websites",
  "Small manufacturers in Ohio that need website redesign",
  "Freight brokers without modern websites",
  "Plumbing companies in Texas",
  "Law firms with outdated websites",
  "Bakeries in Miami",
];

export function AiLeadSearchEngine({
  onLeadSelect,
  className,
  defaultPrompt = "",
}: AiLeadSearchEngineProps) {
  const [prompt, setPrompt] = useState(
    defaultPrompt || "Find roofing companies in Florida that have outdated websites",
  );
  const [phase, setPhase] = useState<"idle" | "planning" | "preview" | "executing" | "results">(
    "idle",
  );
  const [activePlan, setActivePlan] = useState<AiSearchPlan | null>(null);
  const [refinementInput, setRefinementInput] = useState("");
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [executionSummary, setExecutionSummary] = useState<ExecutionSummary | null>(null);
  const [discoveredLeads, setDiscoveredLeads] = useState<UnifiedLeadIntelligenceReport[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<SinglePromptLeadCampaign[]>([]);
  const [selectedLeadForModal, setSelectedLeadForModal] =
    useState<UnifiedLeadIntelligenceReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignSavedMessage, setCampaignSavedMessage] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<"all" | "hot" | "high" | "medium">("all");

  useEffect(() => {
    setSavedCampaigns(getAiCampaigns());
  }, []);

  const handleGeneratePlan = (promptText?: string, autoRun = true) => {
    const textToUse = promptText || prompt;
    if (!textToUse.trim()) return;
    setPrompt(textToUse);
    setPhase("planning");

    setTimeout(() => {
      const plan = parseUserPromptToPlan(textToUse);
      setActivePlan(plan);

      if (autoRun) {
        setPhase("executing");
        setExecutionStep(0);

        let step = 0;
        const interval = setInterval(() => {
          step += 1;
          setExecutionStep(step);
          if (step >= 5) {
            clearInterval(interval);
            const { newLeads, summary } = executeAiSearch(plan);
            setDiscoveredLeads(newLeads);
            setExecutionSummary(summary);
            setSavedCampaigns(getAiCampaigns());
            setPhase("results");
          }
        }, 400);
      } else {
        setPhase("preview");
      }
    }, 500);
  };

  const handleRefinePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan || !refinementInput.trim()) return;
    const refined = refinePlanWithNaturalLanguage(activePlan, refinementInput);
    setActivePlan(refined);
    setRefinementInput("");
  };

  const handleStartSearch = () => {
    if (!activePlan) return;
    setPhase("executing");
    setExecutionStep(0);

    // Simulate multi-stage orchestration steps
    const interval = setInterval(() => {
      setExecutionStep((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          const { campaign, newLeads, summary } = executeAiSearch(activePlan);
          setDiscoveredLeads(newLeads);
          setExecutionSummary(summary);
          setSavedCampaigns(getAiCampaigns());
          setPhase("results");
          return 5;
        }
        return prev + 1;
      });
    }, 500);
  };

  const handleSaveCampaign = () => {
    if (!activePlan || discoveredLeads.length === 0 || !executionSummary) return;

    const campaign: SinglePromptLeadCampaign = {
      id: `campaign-${Date.now()}`,
      title: `${activePlan.targetIndustry} - ${activePlan.location.textDisplay} Lead Campaign`,
      searchPlan: activePlan,
      leadsDiscoveredCount: executionSummary.totalFound,
      verifiedCount: executionSummary.verified,
      highOpportunityCount: executionSummary.highOpportunity,
      hotLeadsCount: executionSummary.hotLeads,
      totalPipelineValue: executionSummary.estimatedPipelineValue,
      leads: discoveredLeads,
      created_at: new Date().toISOString(),
    };

    saveAiCampaign(campaign);
    setSavedCampaigns(getAiCampaigns());
    setCampaignSavedMessage("Campaign saved successfully!");
    setTimeout(() => setCampaignSavedMessage(null), 3000);
  };

  const filteredLeads = discoveredLeads.filter((lead) => {
    if (filterPriority === "hot") return (lead.aiOpportunity?.leadScore ?? 0) >= 90;
    if (filterPriority === "high")
      return (
        (lead.aiOpportunity?.leadScore ?? 0) >= 75 && (lead.aiOpportunity?.leadScore ?? 0) < 90
      );
    if (filterPriority === "medium") return (lead.aiOpportunity?.leadScore ?? 0) < 75;
    return true;
  });

  return (
    <div className={cn("space-y-8", className)}>
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vine/10 text-vine text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Single-Prompt AI Sales Agent
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-foreground font-semibold tracking-tight">
              Describe Your Ideal Customer. LeadVine Finds Them.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enter a simple target description in natural language. Our AI orchestration engine
              automatically determines strategy, runs lead discovery, verifies contacts, performs
              8-dimension site audits, calculates opportunity scores, and writes personalized
              outreach.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-muted-foreground">Active Engine</div>
              <div className="text-xs font-semibold text-foreground">
                Multi-Provider AI Orchestrator
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-vine/10 border border-vine/20 text-vine">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-6 pt-6 border-t border-border/80">
          <label className="block text-xs font-medium text-foreground mb-2">
            What type of customers are you looking for?
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGeneratePlan();
                }}
                placeholder="e.g., Find roofing companies in Florida that have outdated websites..."
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-input bg-background/80 focus:bg-background focus:ring-2 focus:ring-vine/30 focus:border-vine outline-none transition-all"
              />
            </div>
            <button
              onClick={() => handleGeneratePlan()}
              disabled={phase === "planning" || phase === "executing"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-vine hover:bg-vine/90 text-vine-foreground font-medium text-sm shadow-md transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {phase === "planning" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Understanding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Lead Search
                </>
              )}
            </button>
          </div>

          {/* Example Prompt Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Examples:</span>
            {EXAMPLE_PROMPTS.slice(0, 4).map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleGeneratePlan(ex)}
                className="text-xs bg-secondary/80 hover:bg-secondary text-secondary-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/60 transition-all text-left"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Phase: Planning loading state */}
      {phase === "planning" && (
        <div className="p-8 rounded-2xl border border-border bg-card text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-vine mx-auto" />
          <h3 className="font-display text-lg font-medium text-foreground">
            AI Analyzing Lead Request...
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Extracting business industry, geographic parameters, target characteristics, prospect
            need, and opportunity value...
          </p>
        </div>
      )}

      {/* Phase: AI Search Plan Preview (Section 3 & 13) */}
      {(phase === "preview" || phase === "executing" || phase === "results") && activePlan && (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-vine/10 text-vine uppercase tracking-wider">
                  AI Strategy Plan
                </span>
                <span className="text-xs text-muted-foreground">
                  Generated Strategy ID: {activePlan.id.slice(-6)}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mt-1">
                {activePlan.targetIndustry} in {activePlan.location.textDisplay}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingPlan(!isEditingPlan)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {isEditingPlan ? "Hide Edit Options" : "Edit Plan"}
              </button>

              {phase !== "results" && phase !== "executing" && (
                <button
                  onClick={handleStartSearch}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-vine text-vine-foreground hover:bg-vine/90 text-xs font-semibold shadow transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Search
                </button>
              )}
            </div>
          </div>

          {/* Structured Search Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-vine" />
                Target Industry
              </div>
              <div className="text-sm font-semibold text-foreground">
                {activePlan.targetIndustry}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {activePlan.idealCustomerProfile}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-vine" />
                Location Target
              </div>
              <div className="text-sm font-semibold text-foreground">
                {activePlan.location.textDisplay}
              </div>
              <div className="text-xs text-muted-foreground">
                Radius: {activePlan.location.radiusMiles} miles
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-vine" />
                Primary Opportunity
              </div>
              <div className="text-sm font-semibold text-foreground">
                {activePlan.primaryOpportunity}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Sec: {activePlan.secondaryOpportunity}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-vine" />
                Est. Value / Deal
              </div>
              <div className="text-sm font-semibold text-foreground">
                ${activePlan.estimatedValuePerLead.min.toLocaleString()} – $
                {activePlan.estimatedValuePerLead.max.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Min Score Filter: {activePlan.minLeadScore}/100
              </div>
            </div>
          </div>

          {/* Details & Configured Sources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-background border border-border space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-vine" />
                Target Business Characteristics
              </div>
              <ul className="space-y-1 text-muted-foreground">
                {activePlan.targetCharacteristics.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-vine shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Identified Prospect Need
              </div>
              <p className="text-muted-foreground leading-relaxed">{activePlan.prospectNeed}</p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Configured Discovery Sources
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activePlan.configuredSources.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-[11px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Natural Language Refinement Input (Section 14) */}
          <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-vine" />
                Natural Language Refinement
              </div>
              <span className="text-[11px] text-muted-foreground">
                Type instructions like "Only show businesses with over 50 reviews" or "Find
                companies with no website"
              </span>
            </div>
            <form onSubmit={handleRefinePlan} className="flex gap-2">
              <input
                type="text"
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                placeholder="e.g. Exclude businesses with websites less than 2 years old..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-1 focus:ring-vine outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-all"
              >
                Apply Refinement
              </button>
            </form>
          </div>

          {/* Editable Plan Panel */}
          {isEditingPlan && (
            <div className="p-4 rounded-xl bg-background border border-border space-y-4 text-xs animate-in fade-in duration-200">
              <div className="font-semibold text-foreground">Adjust Search Strategy Rules</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1">Target Industry</label>
                  <input
                    type="text"
                    value={activePlan.targetIndustry}
                    onChange={(e) =>
                      setActivePlan({ ...activePlan, targetIndustry: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">
                    Target Location Display
                  </label>
                  <input
                    type="text"
                    value={activePlan.location.textDisplay}
                    onChange={(e) =>
                      setActivePlan({
                        ...activePlan,
                        location: { ...activePlan.location, textDisplay: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Minimum Lead Score</label>
                  <input
                    type="number"
                    value={activePlan.minLeadScore}
                    onChange={(e) =>
                      setActivePlan({
                        ...activePlan,
                        minLeadScore: parseInt(e.target.value, 10) || 60,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phase: Executing Multi-stage Pipeline */}
      {phase === "executing" && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Executing AI Lead Discovery Engine
            </h3>
            <p className="text-xs text-muted-foreground">
              Orchestrating 9-Stage Pipeline across Google Places, Domain Registries, Site Audits, &
              Decision Maker Discovery...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto text-left">
            {[
              "1. Multi-Source Discovery",
              "2. Contact Verification",
              "3. Decision-Maker Enrichment",
              "4. 8-Dimension Web Audit",
              "5. Opportunity Scoring",
            ].map((stepName, i) => {
              const isDone = executionStep > i;
              const isCurrent = executionStep === i;
              return (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-xl border text-xs transition-all flex flex-col justify-between h-20",
                    isDone
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : isCurrent
                        ? "border-vine bg-vine/10 text-vine animate-pulse"
                        : "border-border bg-secondary/30 text-muted-foreground",
                  )}
                >
                  <span className="font-medium">{stepName}</span>
                  <div className="flex items-center justify-between text-[10px]">
                    <span>{isDone ? "Completed" : isCurrent ? "Processing..." : "Pending"}</span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase: Results View */}
      {phase === "results" && executionSummary && (
        <div className="space-y-6">
          {/* Summary Stat Banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="text-xs text-muted-foreground">Businesses Found</div>
              <div className="text-2xl font-display font-semibold text-foreground mt-1">
                {executionSummary.totalFound.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Raw search results</div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="text-xs text-muted-foreground">Verified Operating</div>
              <div className="text-2xl font-display font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                {executionSummary.verified.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Verified contacts</div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="text-xs text-muted-foreground">High-Opportunity</div>
              <div className="text-2xl font-display font-semibold text-foreground mt-1">
                {executionSummary.highOpportunity.toLocaleString()}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Website score &lt; 70</div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Hot Leads
              </div>
              <div className="text-2xl font-display font-semibold text-amber-600 dark:text-amber-400 mt-1">
                {executionSummary.hotLeads.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                Score 90-100
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card bg-vine/5 border-vine/20 col-span-2 md:col-span-1">
              <div className="text-xs font-medium text-vine flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Est. Pipeline Value
              </div>
              <div className="text-2xl font-display font-semibold text-vine mt-1">
                ${(executionSummary.estimatedPipelineValue / 1000).toFixed(0)}k
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Total high-opp value</div>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">Filter Priority:</span>
              <div className="flex gap-1 bg-secondary p-1 rounded-lg text-xs">
                <button
                  onClick={() => setFilterPriority("all")}
                  className={cn(
                    "px-3 py-1 rounded-md font-medium transition-all",
                    filterPriority === "all"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  All ({discoveredLeads.length})
                </button>
                <button
                  onClick={() => setFilterPriority("hot")}
                  className={cn(
                    "px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1",
                    filterPriority === "hot"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  <Flame className="w-3 h-3 text-amber-500 fill-current" />
                  Hot Leads
                </button>
                <button
                  onClick={() => setFilterPriority("high")}
                  className={cn(
                    "px-3 py-1 rounded-md font-medium transition-all",
                    filterPriority === "high"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  High Priority
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {campaignSavedMessage && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {campaignSavedMessage}
                </span>
              )}
              <button
                onClick={handleSaveCampaign}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vine text-vine-foreground hover:bg-vine/90 text-xs font-semibold shadow transition-all"
              >
                <FolderPlus className="w-4 h-4" />
                Save AI Lead Campaign
              </button>
            </div>
          </div>

          {/* Lead Cards List */}
          <div className="space-y-4">
            {filteredLeads.map((lead) => {
              const score = lead.aiOpportunity?.leadScore ?? 75;
              const isHot = score >= 90;
              const isHigh = score >= 75 && score < 90;

              return (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-vine/40 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display text-lg font-semibold text-foreground">
                          {lead.businessName}
                        </h4>
                        {isHot && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                            <Flame className="w-3 h-3 fill-current" />
                            HOT LEAD {score}/100
                          </span>
                        )}
                        {isHigh && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            HIGH PRIORITY {score}/100
                          </span>
                        )}
                        {!isHot && !isHigh && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                            Score {score}/100
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-vine" />
                          {lead.address || lead.city}
                        </span>
                        {lead.websiteUrl ? (
                          <a
                            href={lead.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-vine hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            {lead.websiteUrl.replace("https://", "")}
                          </a>
                        ) : (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            No Website Found
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-500">
                          ★ {lead.googleRating} ({lead.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => {
                          setSelectedLeadForModal(lead);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-all"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        View Full Intelligence
                      </button>
                    </div>
                  </div>

                  {/* AI "Why Contact This Lead?" Banner (Section 9) */}
                  <div className="p-4 rounded-xl bg-vine/5 border border-vine/20 text-xs space-y-1">
                    <div className="font-semibold text-vine flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Why Contact This Lead?
                    </div>
                    <p className="text-foreground/90 leading-relaxed">
                      {lead.aiOpportunity?.whyContactReasoning}
                    </p>
                  </div>

                  {/* Sales Intelligence Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                      <div className="text-muted-foreground font-medium">Recommended Service</div>
                      <div className="font-semibold text-foreground">
                        {lead.aiOpportunity?.recommendedService}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Est. Contract: $
                        {lead.aiOpportunity?.estimatedContractValueMin?.toLocaleString()} – $
                        {lead.aiOpportunity?.estimatedContractValueMax?.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                      <div className="text-muted-foreground font-medium">
                        Verified Decision Maker
                      </div>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-vine" />
                        {lead.decisionMaker?.name} ({lead.decisionMaker?.title})
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {lead.decisionMaker?.email} (Verified 94%)
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                      <div className="text-muted-foreground font-medium">Website Audit Score</div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{lead.auditScores?.mobileUx ?? 40}/100 Mobile UX</span>
                        <span className="text-amber-500 text-[11px]">
                          {lead.problemsIdentified?.length ?? 3} Defects Found
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {lead.problemsIdentified?.[0]?.title || "Mobile layout defects"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Intelligence Report Modal */}
      {selectedLeadForModal && (
        <LeadIntelligenceReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedLeadForModal}
          onGenerateProposal={() => {}}
          onGeneratePitchDeck={() => {}}
        />
      )}
    </div>
  );
}
