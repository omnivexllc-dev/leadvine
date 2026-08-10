import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PipelineStage, UnifiedLeadIntelligenceReport } from "@/modules/types";
import {
  PIPELINE_STAGES,
  loadIntelligenceReports,
  saveIntelligenceReports,
  generateIntelligenceReportForLead,
} from "@/services/leadIntelligence.service";
import { LeadIntelligenceReportModal } from "@/components/leads/LeadIntelligenceReportModal";
import {
  Building,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MoreHorizontal,
  FileText,
  Send,
  Zap,
  Globe,
  DollarSign,
  Users,
  Download,
  Sparkles,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/app/pipeline")({
  head: () => ({ meta: [{ title: "9-Stage Pipeline — LeadVine" }] }),
  component: PipelineEngine,
});

function PipelineEngine() {
  const [reports, setReports] = useState<UnifiedLeadIntelligenceReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UnifiedLeadIntelligenceReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadWebsite, setNewLeadWebsite] = useState("");
  const [isAddingLead, setIsAddingLead] = useState(false);

  useEffect(() => {
    setReports(loadIntelligenceReports());
  }, []);

  const handleUpdateReport = (updated: UnifiedLeadIntelligenceReport) => {
    const next = reports.map((r) => (r.id === updated.id ? updated : r));
    setReports(next);
    saveIntelligenceReports(next);
    if (selectedReport?.id === updated.id) {
      setSelectedReport(updated);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;
    const newReport = generateIntelligenceReportForLead({
      name: newLeadName,
      website: newLeadWebsite || undefined,
    });
    const next = [newReport, ...reports];
    setReports(next);
    saveIntelligenceReports(next);
    setNewLeadName("");
    setNewLeadWebsite("");
    setIsAddingLead(false);
    toast.success(`Created lead "${newReport.businessName}" in Pipeline!`);
  };

  const handleMoveStage = (report: UnifiedLeadIntelligenceReport, direction: "next" | "prev") => {
    const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === report.pipelineStage);
    const targetIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= PIPELINE_STAGES.length) return;

    const nextStage = PIPELINE_STAGES[targetIdx].id;
    const updated = { ...report, pipelineStage: nextStage, updated_at: new Date().toISOString() };
    handleUpdateReport(updated);
    toast.success(`Moved ${report.businessName} to ${PIPELINE_STAGES[targetIdx].label}`);
  };

  // Filter logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || r.pipelineStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Calculate Pipeline Metrics
  const totalLeads = reports.length;
  const highPriorityCount = reports.filter((r) => r.aiOpportunity.leadScore >= 80).length;
  const totalPipelineValue = reports.reduce(
    (acc, r) =>
      acc +
      (r.aiOpportunity.estimatedContractValueMin + r.aiOpportunity.estimatedContractValueMax) / 2,
    0,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="text-xs uppercase font-mono font-bold tracking-widest text-vine mb-1 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" />
            AI Sales Intelligence Platform
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            9-Stage Lead Intelligence Pipeline
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Discover → Verify → Enrich → Analyze → Score → Prioritize → Contact → Track → Convert
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddingLead(!isAddingLead)}
            className="bg-vine hover:bg-vine/90 text-white gap-2 text-xs"
          >
            <Plus className="h-4 w-4" /> Add Lead to Pipeline
          </Button>
        </div>
      </div>

      {/* Add Lead Form Drawer */}
      {isAddingLead && (
        <form
          onSubmit={handleCreateLead}
          className="p-4 rounded-xl border border-vine/30 bg-card/80 backdrop-blur space-y-3 animate-in fade-in slide-in-from-top-2"
        >
          <div className="text-xs font-bold text-vine uppercase font-mono">
            Quick Lead Discovery Input
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Business Name (e.g. Acme Dental Austin)"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
              className="text-xs bg-background"
              required
            />
            <Input
              placeholder="Website URL (e.g. acmedental.com)"
              value={newLeadWebsite}
              onChange={(e) => setNewLeadWebsite(e.target.value)}
              className="text-xs bg-background"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingLead(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-vine text-white text-xs">
              Generate Lead Intelligence
            </Button>
          </div>
        </form>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Total Pipeline Leads
          </div>
          <div className="font-display text-2xl font-bold">{totalLeads}</div>
          <p className="text-[11px] text-muted-foreground">Active prospect records</p>
        </div>

        <div className="p-4 rounded-xl border border-vine/30 bg-vine/5 space-y-1">
          <div className="text-xs text-vine font-mono uppercase font-bold flex items-center justify-between">
            <span>High Priority Targets</span>
            <Flame className="h-4 w-4" />
          </div>
          <div className="font-display text-2xl font-bold text-vine">{highPriorityCount}</div>
          <p className="text-[11px] text-muted-foreground">Score 80+ high intent</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Pipeline Deal Value
          </div>
          <div className="font-display text-2xl font-bold text-green-500">
            ${Math.round(totalPipelineValue).toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground">Estimated agency contracts</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Avg. Site Audit Score
          </div>
          <div className="font-display text-2xl font-bold text-amber-500">38/100</div>
          <p className="text-[11px] text-muted-foreground">High redesign opportunity</p>
        </div>
      </div>

      {/* 9-Stage Progress Bar & Filters */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-4">
        {/* Stage Buttons */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center min-w-[850px] gap-1.5">
            <button
              onClick={() => setStageFilter("all")}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
                stageFilter === "all"
                  ? "bg-vine text-white border-vine font-bold"
                  : "bg-background text-muted-foreground border-border hover:border-vine/40",
              )}
            >
              All Stages ({reports.length})
            </button>
            {PIPELINE_STAGES.map((s, idx) => {
              const count = reports.filter((r) => r.pipelineStage === s.id).length;
              const isSelected = stageFilter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setStageFilter(s.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap",
                    isSelected
                      ? "bg-vine text-white border-vine font-bold"
                      : "bg-background text-muted-foreground border-border hover:border-vine/40",
                  )}
                >
                  <span>
                    {idx + 1}. {s.label.split(" ")[1]}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads, cities, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center p-1 bg-muted rounded-lg border border-border">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-all",
                  viewMode === "kanban"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                <Kanban className="h-3.5 w-3.5" /> Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-all",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                <TableIcon className="h-3.5 w-3.5" /> Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {PIPELINE_STAGES.map((s, stageIdx) => {
              const stageLeads = filteredReports.filter((r) => r.pipelineStage === s.id);
              return (
                <div
                  key={s.id}
                  className="w-80 flex-shrink-0 bg-card/60 border border-border rounded-xl flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-border bg-sidebar/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className="text-vine font-mono">{stageIdx + 1}.</span>
                        <span>{s.label.split(" ")[1]}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {s.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] bg-background">
                      {stageLeads.length}
                    </Badge>
                  </div>

                  {/* Column Cards */}
                  <div className="p-3 overflow-y-auto space-y-3 flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="p-4 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                        No leads in stage
                      </div>
                    ) : (
                      stageLeads.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-xl border border-border bg-card hover:border-vine/50 transition-all space-y-3 shadow-sm group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display font-bold text-sm text-foreground line-clamp-1">
                                {r.businessName}
                              </h4>
                              <span className="text-[11px] text-muted-foreground block line-clamp-1">
                                {r.category} • {r.city}
                              </span>
                            </div>
                            <Badge
                              className={cn(
                                "font-mono font-bold text-[10px] shrink-0",
                                r.aiOpportunity.leadScore >= 80
                                  ? "bg-red-500/20 text-red-500 border-red-500/30"
                                  : "bg-amber-500/20 text-amber-500",
                              )}
                            >
                              {r.aiOpportunity.leadScore}/100
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-2.5 rounded-lg border border-border">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span>Decision Maker:</span>
                              <span className="font-bold text-foreground">
                                {r.decisionMaker.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span>Est. Deal Value:</span>
                              <span className="font-bold text-green-500">
                                ${r.aiOpportunity.estimatedContractValueMin.toLocaleString()} – $
                                {r.aiOpportunity.estimatedContractValueMax.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReport(r);
                                setIsReportOpen(true);
                              }}
                              className="text-[11px] gap-1 h-7 text-vine border-vine/30 hover:bg-vine/10"
                            >
                              <Sparkles className="h-3 w-3" /> Report
                            </Button>

                            <div className="flex items-center gap-1">
                              {stageIdx > 0 && (
                                <button
                                  onClick={() => handleMoveStage(r, "prev")}
                                  className="p-1 rounded text-muted-foreground hover:bg-muted"
                                  title="Move to previous stage"
                                >
                                  ←
                                </button>
                              )}
                              {stageIdx < PIPELINE_STAGES.length - 1 && (
                                <button
                                  onClick={() => handleMoveStage(r, "next")}
                                  className="p-1 rounded text-muted-foreground hover:bg-muted"
                                  title="Move to next stage"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Business</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Decision Maker</th>
                  <th className="p-3">Pipeline Stage</th>
                  <th className="p-3">Est. Value</th>
                  <th className="p-3">Recommended Offer</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{r.businessName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.category} • {r.city}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <Badge variant="outline" className="text-vine border-vine/30">
                        {r.aiOpportunity.leadScore}/100
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{r.decisionMaker.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.decisionMaker.email}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-vine/15 text-vine border-vine/30 font-mono text-[10px] uppercase">
                        {r.pipelineStage}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold text-green-500">
                      ${r.aiOpportunity.estimatedContractValueMin.toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-xs truncate">
                      {r.aiOpportunity.recommendedService}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(r);
                          setIsReportOpen(true);
                        }}
                        className="text-xs text-vine border-vine/30 hover:bg-vine/10"
                      >
                        View Intelligence Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Lead Intelligence Report Modal */}
      <LeadIntelligenceReportModal
        report={selectedReport}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onUpdateReport={handleUpdateReport}
      />
    </div>
  );
}
