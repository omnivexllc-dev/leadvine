import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAiCampaigns, deleteAiCampaign } from "@/services/aiLeadSearch.service";
import { SinglePromptLeadCampaign, UnifiedLeadIntelligenceReport } from "@/modules/types";
import {
  FolderPlus,
  Trash2,
  ExternalLink,
  Flame,
  Building2,
  MapPin,
  TrendingUp,
  DollarSign,
  Search,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { LeadIntelligenceReportModal } from "@/components/leads/LeadIntelligenceReportModal";

export const Route = createFileRoute("/_authenticated/app/prospect-campaigns")({
  head: () => ({ meta: [{ title: "AI Prospect Campaigns — LeadVine" }] }),
  component: ProspectCampaigns,
});

function ProspectCampaigns() {
  const [campaigns, setCampaigns] = useState<SinglePromptLeadCampaign[]>([]);
  const [selectedReport, setSelectedReport] = useState<UnifiedLeadIntelligenceReport | null>(null);

  useEffect(() => {
    setCampaigns(getAiCampaigns());
  }, []);

  const handleDelete = (id: string) => {
    deleteAiCampaign(id);
    setCampaigns(getAiCampaigns());
  };

  return (
    <div className="space-y-8">
      <LeadIntelligenceReportModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-vine mb-1 font-semibold">
            Campaign Hub
          </div>
          <h1 className="font-display text-3xl md:text-4xl">AI Lead Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved single-prompt search strategies, target criteria, discovered leads, and sales
            intelligence.
          </p>
        </div>

        <Link
          to="/app/find-leads"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vine text-vine-foreground font-semibold text-xs shadow hover:bg-vine/90 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Create New AI Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-4">
          <FolderPlus className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              No Saved AI Campaigns Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Run a single-prompt AI search on the Dashboard or Find Leads page and save your
              generated strategy as a reusable campaign.
            </p>
          </div>
          <Link
            to="/app/find-leads"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            Launch AI Lead Engine
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-vine/10 text-vine uppercase tracking-wider">
                      AI Lead Campaign
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(camp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2.5 py-1 rounded-md inline-block">
                    "{camp.searchPlan.userPrompt}"
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/app/find-leads"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-all"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Rerun Search
                  </Link>

                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60">
                  <div className="text-muted-foreground">Discovered Businesses</div>
                  <div className="text-lg font-semibold text-foreground mt-0.5">
                    {camp.leadsDiscoveredCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60">
                  <div className="text-muted-foreground">Verified Prospects</div>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {camp.verifiedCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Hot Prospects
                  </div>
                  <div className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                    {camp.hotLeadsCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-vine/10 border border-vine/20">
                  <div className="text-vine font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Est. Pipeline Value
                  </div>
                  <div className="text-lg font-semibold text-vine mt-0.5">
                    ${(camp.totalPipelineValue / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>

              {/* Sample Leads in Campaign */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-foreground">
                  Saved Campaign Leads ({camp.leads.length})
                </div>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-background">
                  {camp.leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/20 transition-all text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {lead.businessName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Score {lead.aiOpportunity?.leadScore}/100
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-3">
                          <span>{lead.city}</span>
                          <span>
                            ★ {lead.googleRating} ({lead.reviewCount} reviews)
                          </span>
                          <span className="text-vine">
                            {lead.aiOpportunity?.recommendedService}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedReport(lead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium self-start sm:self-auto"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        View Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
