import { useState } from "react";
import { getPrioritizedLeads } from "./leadPrioritization.service";
import { PrioritizedLead } from "../types";
import { Flame, Star, Filter, ArrowUpDown, DollarSign, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function LeadPrioritizationModule() {
  const [leads, setLeads] = useState<PrioritizedLead[]>(getPrioritizedLeads());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all" ? leads : leads.filter((l) => l.actionStatus === statusFilter);

  const totalPipelineEst = leads.reduce((acc, curr) => acc + curr.estimatedContractValue, 0);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 9</div>
        <h1 className="font-display text-3xl font-bold mb-2">Lead Prioritization Engine</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Ranks agency prospects dynamically by Opportunity Rating, Contract Size, Domain Health,
          and Tech Stack to focus outreach on high-close deals.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Top Ranked Prospects
          </div>
          <div className="text-2xl font-bold font-mono text-vine">
            {leads.length} High-Value Leads
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground font-mono uppercase">
            Estimated Web Contract Pipeline
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${totalPipelineEst.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground font-mono uppercase">Avg Contract Size</div>
          <div className="text-2xl font-bold font-mono text-foreground">
            ${Math.round(totalPipelineEst / (leads.length || 1)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-vine" />
          <span className="text-xs font-semibold text-muted-foreground">Filter Action Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium"
          >
            <option value="all">All Prospects</option>
            <option value="uncontacted">Uncontacted</option>
            <option value="analyzed">Analyzed</option>
            <option value="pitch_sent">Pitch Sent</option>
            <option value="meeting_booked">Meeting Booked</option>
          </select>
        </div>
      </div>

      {/* Ranked Leads Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/60 text-muted-foreground font-mono uppercase">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Business Name / City</th>
                <th className="p-3">Opportunity Score</th>
                <th className="p-3">Primary Pitch Trigger</th>
                <th className="p-3">Est. Deal Value</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-secondary/30">
                  <td className="p-3 font-mono font-bold text-vine">#{lead.rank}</td>
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{lead.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {lead.website} · {lead.city}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 font-mono font-bold text-vine">
                      <Star className="h-3.5 w-3.5 fill-current" /> {lead.opportunityScore}/100
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground max-w-xs">{lead.primaryReason}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    ${lead.estimatedContractValue.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono uppercase text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-secondary text-foreground">
                      {lead.actionStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toast.success(`Drafted pitch email for ${lead.name}!`)}
                      className="inline-flex items-center gap-1 bg-vine text-background font-semibold px-3 py-1.5 rounded text-[11px]"
                    >
                      <Send className="h-3 w-3" /> Draft Pitch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
