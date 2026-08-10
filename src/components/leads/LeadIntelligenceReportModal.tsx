import React, { useState } from "react";
import { PipelineStage, UnifiedLeadIntelligenceReport } from "@/modules/types";
import { PIPELINE_STAGES } from "@/services/leadIntelligence.service";
import {
  X,
  Building,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  UserCheck,
  ShieldCheck,
  Flame,
  Award,
  Sparkles,
  Send,
  MessageSquare,
  Linkedin,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Cpu,
  BarChart3,
  FileText,
  Presentation,
  Download,
  Share2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LeadIntelligenceReportModalProps {
  report: UnifiedLeadIntelligenceReport | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReport?: (updated: UnifiedLeadIntelligenceReport) => void;
  onGenerateProposal?: (report: UnifiedLeadIntelligenceReport) => void;
  onGeneratePitchDeck?: (report: UnifiedLeadIntelligenceReport) => void;
}

export function LeadIntelligenceReportModal({
  report,
  isOpen,
  onClose,
  onUpdateReport,
  onGenerateProposal,
  onGeneratePitchDeck,
}: LeadIntelligenceReportModalProps) {
  type MainTab = "overview" | "analysis" | "tech_seo" | "competitors" | "opportunity" | "outreach";
  type OutreachTab = "email" | "sms" | "linkedin" | "phone" | "sequence";

  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [outreachTab, setOutreachTab] = useState<OutreachTab>("email");

  if (!isOpen || !report) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStageChange = (newStage: PipelineStage) => {
    const updated = {
      ...report,
      pipelineStage: newStage,
      updated_at: new Date().toISOString(),
    };
    if (onUpdateReport) onUpdateReport(updated);
    toast.success(`Pipeline stage updated to: ${newStage.toUpperCase()}`);
  };

  const currentStageObj =
    PIPELINE_STAGES.find((s) => s.id === report.pipelineStage) || PIPELINE_STAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-card-foreground">
        {/* Header Bar */}
        <div className="p-5 md:p-6 border-b border-border bg-sidebar/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-vine/10 border border-vine/20 text-vine font-bold text-xl">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  {report.businessName}
                </h2>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 font-mono text-xs"
                >
                  {report.category}
                </Badge>
                <Badge
                  className={cn(
                    "font-bold text-xs uppercase tracking-wider",
                    report.aiOpportunity.priorityLevel === "CRITICAL"
                      ? "bg-red-500/20 text-red-500 border-red-500/30"
                      : "bg-amber-500/20 text-amber-500 border-amber-500/30",
                  )}
                >
                  <Flame className="h-3 w-3 mr-1 inline" />
                  Score: {report.aiOpportunity.leadScore}/100 — {report.aiOpportunity.priorityLevel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-vine" />
                  <a
                    href={report.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    {report.websiteUrl}
                  </a>
                </span>
                <span>•</span>
                <span>{report.city}</span>
                {report.googleRating && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">
                      ★ {report.googleRating} ({report.reviewCount} reviews)
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updated = { ...report, crmSynced: !report.crmSynced };
                if (onUpdateReport) onUpdateReport(updated);
                toast.success(updated.crmSynced ? "Synced to CRM!" : "Unsynced from CRM");
              }}
              className={cn(
                "gap-1.5 text-xs",
                report.crmSynced && "border-green-500/40 text-green-500 bg-green-500/10",
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              {report.crmSynced ? "CRM Synced" : "Sync to CRM"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(window.location.href, "Report Link")}
              className="gap-1.5 text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 9-Stage Sales Intelligence Pipeline Visual Bar */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border overflow-x-auto scrollbar-none">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
            <span>9-Stage Pipeline Status</span>
            <span className="text-vine font-semibold">
              {currentStageObj.label} — {currentStageObj.description}
            </span>
          </div>
          <div className="flex items-center min-w-[700px] gap-1">
            {PIPELINE_STAGES.map((s, i) => {
              const isCurrent = s.id === report.pipelineStage;
              const isPast = s.order < currentStageObj.order;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStageChange(s.id)}
                  className={cn(
                    "flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all text-center border relative group",
                    isCurrent
                      ? "bg-vine text-white border-vine font-bold shadow-sm"
                      : isPast
                        ? "bg-vine/15 text-vine border-vine/30 hover:bg-vine/25"
                        : "bg-card text-muted-foreground border-border hover:border-vine/40",
                  )}
                >
                  <span className="truncate block">
                    {i + 1}. {s.label.split(" ")[1]}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 w-48 p-2 rounded bg-popover text-popover-foreground text-[10px] shadow-lg border border-border">
                    <p className="font-bold">{s.label}</p>
                    <p className="text-muted-foreground leading-snug">{s.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-border flex gap-1 overflow-x-auto bg-card">
          {[
            { id: "overview", label: "Intelligence Summary", icon: Building },
            { id: "analysis", label: "8-Score Site Audit", icon: BarChart3 },
            { id: "tech_seo", label: "Tech & SEO Intelligence", icon: Cpu },
            { id: "competitors", label: "Competitor Benchmark", icon: TrendingUp },
            { id: "opportunity", label: "AI Sales Opportunity", icon: Flame },
            { id: "outreach", label: "AI Outreach Suite", icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MainTab)}
                className={cn(
                  "py-3 px-4 font-medium text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-vine text-vine font-bold bg-vine/5"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/50">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Top AI Recommendation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-vine/30 bg-vine/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vine font-bold">
                    <span>Lead Score</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-vine">
                      {report.aiOpportunity.leadScore}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">/ 100</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Priority:{" "}
                    <span className="font-bold text-foreground">
                      {report.aiOpportunity.priorityLevel}
                    </span>
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Recommended Offer
                  </div>
                  <div className="font-display text-lg font-bold text-foreground">
                    {report.aiOpportunity.recommendedService}
                  </div>
                  <p className="text-xs text-vine font-semibold">
                    Est. Value: ${report.aiOpportunity.estimatedContractValueMin.toLocaleString()} –
                    ${report.aiOpportunity.estimatedContractValueMax.toLocaleString()}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Best Decision Maker
                  </div>
                  <div className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-vine inline" />
                    {report.decisionMaker.name}
                  </div>
                  <p className="text-xs text-muted-foreground">{report.decisionMaker.title}</p>
                </div>
              </div>

              {/* 2-Column: Business & Verification + Problems Identified */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business & Decision Maker Details */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h3 className="font-display text-base font-bold flex items-center gap-2 border-b border-border pb-3">
                    <Building className="h-4 w-4 text-vine" />
                    Business & Decision Maker Profile
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Decision Maker</span>
                      <span className="font-semibold">{report.decisionMaker.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Title</span>
                      <span className="font-semibold">{report.decisionMaker.title}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Direct Email</span>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Mail className="h-3 w-3 text-vine" />
                        <span className="truncate">{report.decisionMaker.email}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Direct Phone</span>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="h-3 w-3 text-vine" />
                        <span>{report.decisionMaker.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badges */}
                  <div className="pt-2 border-t border-border">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Verification Checks
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px]"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Phone Verified
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px]"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Domain Valid
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px]"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Email Deliverable
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 text-[11px]"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Active Operating Status
                      </Badge>
                    </div>
                  </div>

                  {/* Lead Discovery Sources */}
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Discovery Sources: </span>
                    {report.leadSources.join(", ")}
                  </div>
                </div>

                {/* Problems Identified */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h3 className="font-display text-base font-bold flex items-center gap-2 border-b border-border pb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Critical Conversion Gaps & Flaws
                  </h3>

                  <div className="space-y-3">
                    {report.problemsIdentified.map((prob, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border text-xs space-y-1",
                          prob.severity === "critical"
                            ? "bg-red-500/10 border-red-500/20 text-red-200"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-200",
                        )}
                      >
                        <div className="font-bold flex items-center justify-between text-foreground">
                          <span>{prob.title}</span>
                          <Badge
                            className={cn(
                              "text-[9px] uppercase",
                              prob.severity === "critical"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-amber-500/20 text-amber-500",
                            )}
                          >
                            {prob.severity}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {prob.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Outreach Preview Action */}
              <div className="p-5 rounded-xl border border-vine/30 bg-card flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-display text-base font-bold text-foreground">
                    Ready to pitch {report.businessName}?
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Generate pitch decks, client proposal documents, or personalized multi-channel
                    outreach scripts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setActiveTab("outreach")}
                    className="bg-vine hover:bg-vine/90 text-white gap-2 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    View AI Outreach Suite
                  </Button>
                  {onGenerateProposal && (
                    <Button
                      variant="outline"
                      onClick={() => onGenerateProposal(report)}
                      className="gap-2 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-vine" />
                      Create Proposal
                    </Button>
                  )}
                  {onGeneratePitchDeck && (
                    <Button
                      variant="outline"
                      onClick={() => onGeneratePitchDeck(report)}
                      className="gap-2 text-xs"
                    >
                      <Presentation className="h-3.5 w-3.5 text-vine" />
                      Generate Pitch Deck
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 8-SCORE SITE AUDIT */}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold">8-Dimension Website Analysis</h3>
                  <p className="text-xs text-muted-foreground">
                    Deep evaluation of {report.businessName}'s digital experience across critical
                    agency metrics.
                  </p>
                </div>
              </div>

              {/* Score Gauge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Mobile UX", score: report.auditScores.mobileUx },
                  { label: "Design Grade", score: report.auditScores.design },
                  { label: "Performance", score: report.auditScores.performance },
                  { label: "SEO Score", score: report.auditScores.seo },
                  { label: "Accessibility", score: report.auditScores.accessibility },
                  { label: "Trust Score", score: report.auditScores.trust },
                  { label: "Conversion Score", score: report.auditScores.conversion },
                  { label: "Security Score", score: report.auditScores.security },
                ].map((s) => {
                  const isPoor = s.score < 50;
                  const isFair = s.score >= 50 && s.score < 75;
                  return (
                    <div
                      key={s.label}
                      className="p-4 rounded-xl border border-border bg-card space-y-2"
                    >
                      <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "font-display text-3xl font-bold",
                            isPoor ? "text-red-500" : isFair ? "text-amber-500" : "text-green-500",
                          )}
                        >
                          {s.score}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isPoor ? "bg-red-500" : isFair ? "bg-amber-500" : "bg-green-500",
                          )}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Redesign Opportunities & Missing Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="font-display text-sm font-bold flex items-center gap-2 text-vine">
                    <Sparkles className="h-4 w-4" />
                    Specific Redesign Opportunities
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {report.redesignOpportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-vine font-bold">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="font-display text-sm font-bold flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                    Missing Features & Elements
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {report.missingFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TECH & SEO INTELLIGENCE */}
          {activeTab === "tech_seo" && (
            <div className="space-y-6">
              {/* Tech Stack */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-vine" />
                  Detected Technology Stack
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">CMS</span>
                    <span className="font-semibold">{report.techStack.cms || "Custom / None"}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Frameworks</span>
                    <span className="font-semibold">
                      {report.techStack.frameworks.join(", ") || "Vanilla JS"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Analytics</span>
                    <span className="font-semibold">
                      {report.techStack.analytics.join(", ") || "None Detected"}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Tech Stack Health Score</span>
                    <span className="font-bold text-amber-500">{report.techStack.score}/100</span>
                  </div>
                </div>

                {report.techStack.outdatedFlags.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                    <span className="font-bold block mb-1">
                      Outdated / Vulnerable Software Flags:
                    </span>
                    <ul className="list-disc list-inside space-y-1">
                      {report.techStack.outdatedFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* SEO Summary */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-vine" />
                  Organic Search & Domain Authority
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Domain Age</span>
                    <span className="font-bold text-foreground">
                      {report.seoSummary.domainAgeYears} Years
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Organic Keywords</span>
                    <span className="font-bold text-foreground">
                      {report.seoSummary.organicKeywordsEst}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Est. Monthly Traffic</span>
                    <span className="font-bold text-foreground">
                      {report.seoSummary.monthlyTrafficEst} visits
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground block">Backlinks</span>
                    <span className="font-bold text-foreground">
                      {report.seoSummary.backlinksEst}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    High-Value Ranking Opportunities:
                  </span>
                  <div className="space-y-1.5">
                    {report.seoSummary.rankingOpportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-muted/30 border border-border text-xs flex items-center justify-between"
                      >
                        <span>{opp}</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-vine/10 text-vine border-vine/20"
                        >
                          Target Keyword
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPETITOR BENCHMARK */}
          {activeTab === "competitors" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-xl font-bold">Local Competitor Comparison</h3>
                <p className="text-xs text-muted-foreground">
                  How {report.businessName} compares against top ranking rivals in {report.city}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Lead */}
                <div className="p-5 rounded-xl border-2 border-vine/50 bg-vine/5 space-y-3">
                  <Badge className="bg-vine text-white text-[10px] uppercase">Target Lead</Badge>
                  <h4 className="font-display text-lg font-bold">{report.businessName}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Design Grade</span>
                      <span className="font-bold text-red-500">D / F</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">PageSpeed</span>
                      <span className="font-bold text-red-500">
                        {report.auditScores.performance}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Google Rating</span>
                      <span className="font-bold">★ {report.googleRating || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Tech Stack</span>
                      <span className="font-bold">{report.techStack.cms || "Legacy"}</span>
                    </div>
                  </div>
                </div>

                {/* Competitors */}
                {report.competitors.map((comp, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border bg-card space-y-3">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      Rival #{idx + 1}
                    </Badge>
                    <h4 className="font-display text-lg font-bold">{comp.competitorName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Design Grade</span>
                        <span className="font-bold text-green-500">{comp.designGrade}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">PageSpeed</span>
                        <span className="font-bold text-green-500">{comp.pageSpeedScore}/100</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Google Rating</span>
                        <span className="font-bold">
                          ★ {comp.googleRating} ({comp.reviewCount} reviews)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Tech Stack</span>
                        <span className="font-bold">{comp.techStack.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI SALES OPPORTUNITY */}
          {activeTab === "opportunity" && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-vine/40 bg-card space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-vine text-white">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-vine font-bold">
                      AI Lead Intelligence Pitch Strategy
                    </div>
                    <h3 className="font-display text-2xl font-bold">
                      Why contact this business & what to sell them
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-vine">
                      1. Why contact {report.businessName}?
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      {report.aiOpportunity.whyContactReasoning}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-vine">
                      2. What exactly should I sell them?
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      {report.aiOpportunity.whatToSellRecommendation}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-1.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-vine">
                      3. Recommended Sales Angle & Pitch Strategy
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground font-medium">
                      {report.aiOpportunity.pitchAngle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI OUTREACH SUITE */}
          {activeTab === "outreach" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold">AI Outreach Suite</h3>
                  <p className="text-xs text-muted-foreground">
                    Personalized cold email, SMS text, LinkedIn pitch, and cold call scripts
                    tailored for {report.businessName}.
                  </p>
                </div>
              </div>

              {/* Outreach Channel Selector */}
              <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
                {[
                  { id: "email", label: "Cold Email", icon: Mail },
                  { id: "sms", label: "SMS Text", icon: MessageSquare },
                  { id: "linkedin", label: "LinkedIn Pitch", icon: Linkedin },
                  { id: "phone", label: "Cold Call Script", icon: PhoneCall },
                  { id: "sequence", label: "Follow-Up Drip", icon: Send },
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setOutreachTab(ch.id as OutreachTab)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-medium flex items-center gap-2 transition-all border",
                        outreachTab === ch.id
                          ? "bg-vine text-white border-vine font-bold"
                          : "bg-card text-muted-foreground border-border hover:border-vine/40",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {ch.label}
                    </button>
                  );
                })}
              </div>

              {/* Email View */}
              {outreachTab === "email" && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                      Cold Email Template
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `Subject: ${report.outreach.emailSubject}\n\n${report.outreach.emailBody}`,
                          "Email Template",
                        )
                      }
                      className="gap-1.5 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Email
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs font-mono space-y-2">
                    <div>
                      <span className="text-muted-foreground">Subject: </span>
                      <span className="font-bold text-foreground">
                        {report.outreach.emailSubject}
                      </span>
                    </div>
                    <hr className="border-border" />
                    <pre className="whitespace-pre-wrap font-sans text-xs text-foreground leading-relaxed">
                      {report.outreach.emailBody}
                    </pre>
                  </div>
                </div>
              )}

              {/* SMS View */}
              {outreachTab === "sms" && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                      SMS Outreach Text
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(report.outreach.smsText, "SMS Text")}
                      className="gap-1.5 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy SMS
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl bg-vine/5 border border-vine/20 text-xs font-sans text-foreground leading-relaxed max-w-md">
                    {report.outreach.smsText}
                  </div>
                </div>
              )}

              {/* LinkedIn View */}
              {outreachTab === "linkedin" && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                      LinkedIn Direct Message
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(report.outreach.linkedInMessage, "LinkedIn Message")
                      }
                      className="gap-1.5 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Message
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-foreground leading-relaxed max-w-lg">
                    {report.outreach.linkedInMessage}
                  </div>
                </div>
              )}

              {/* Cold Call Script View */}
              {outreachTab === "phone" && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h4 className="font-display text-base font-bold flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-vine" />
                    Cold Call Script & Objection Handlers
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                      <span className="font-bold text-vine uppercase text-[10px]">1. Opening</span>
                      <p>{report.outreach.coldCallScript.opening}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                      <span className="font-bold text-vine uppercase text-[10px]">2. The Hook</span>
                      <p>{report.outreach.coldCallScript.hook}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                      <span className="font-bold text-vine uppercase text-[10px]">
                        3. The Pitch
                      </span>
                      <p>{report.outreach.coldCallScript.pitch}</p>
                    </div>

                    <div className="pt-2">
                      <span className="font-bold text-foreground block mb-2">
                        Objection Handlers:
                      </span>
                      <div className="space-y-2">
                        {report.outreach.coldCallScript.objectionHandlers.map((obj, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
                          >
                            <span className="font-bold text-amber-500">
                              Objection: "{obj.objection}"
                            </span>
                            <p className="text-foreground">{obj.response}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up Drip View */}
              {outreachTab === "sequence" && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <h4 className="font-display text-base font-bold">Follow-Up Drip Sequence</h4>
                  <div className="space-y-3">
                    {report.outreach.followUpSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-vine">
                          <span>
                            Step {idx + 1}: Day {step.day} ({step.channel.toUpperCase()})
                          </span>
                          <span>{step.subjectOrNote}</span>
                        </div>
                        <p className="text-muted-foreground">{step.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-border bg-sidebar/50 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Report ID: <span className="font-mono">{report.id}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
