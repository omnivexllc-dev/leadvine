import { useState } from "react";
import { getCampaignsData } from "./emailCampaigns.service";
import { EmailCampaign } from "../types";
import { Send, Clock, BarChart2, Plus, Play, Pause, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function EmailCampaignsModule() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(getCampaignsData());

  const handleAddCampaign = () => {
    const name = prompt("Enter Campaign Name e.g. Plumbing Agencies Q3 Campaign:");
    if (!name) return;

    const newCamp: EmailCampaign = {
      id: `camp-${Date.now()}`,
      name,
      status: "active",
      totalProspects: 0,
      sentCount: 0,
      openRatePct: 0,
      clickRatePct: 0,
      replyRatePct: 0,
      meetingsBooked: 0,
      steps: [
        {
          id: "s1",
          stepNumber: 1,
          type: "email",
          title: "Initial Web Audit Email",
          subject: "Quick website question",
        },
        { id: "s2", stepNumber: 2, type: "delay", title: "Delay 3 Days", delayDays: 3 },
        {
          id: "s3",
          stepNumber: 3,
          type: "followup",
          title: "Competitor Benchmark Follow-up",
          subject: "Local competitor comparison",
        },
      ],
    };

    setCampaigns([newCamp, ...campaigns]);
    toast.success(`Created new campaign "${name}"!`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 11</div>
          <h1 className="font-display text-3xl font-bold mb-2">Email Campaigns</h1>
          <p className="text-muted-foreground text-sm max-w-3xl">
            Multi-step drip outreach sequences with automated delay steps, engagement tracking, and
            meeting booking attribution.
          </p>
        </div>
        <button
          onClick={handleAddCampaign}
          className="inline-flex items-center gap-2 rounded-lg bg-vine px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Drip Campaign
        </button>
      </div>

      {/* Campaigns List */}
      {campaigns.map((camp) => (
        <div key={camp.id} className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display">{camp.name}</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-bold">
                  {camp.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {camp.totalProspects} Target Prospects in Sequence
              </p>
            </div>

            {/* Campaign Analytics Metrics */}
            <div className="flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block">Open Rate</span>
                <span className="text-sm font-bold text-vine">{camp.openRatePct}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Click Rate</span>
                <span className="text-sm font-bold text-foreground">{camp.clickRatePct}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Reply Rate</span>
                <span className="text-sm font-bold text-emerald-400">{camp.replyRatePct}%</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Meetings Booked</span>
                <span className="text-sm font-bold text-amber-400">{camp.meetingsBooked}</span>
              </div>
            </div>
          </div>

          {/* Drip Steps Flow */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase text-muted-foreground">
              Sequence Timeline Flow
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {camp.steps.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="p-3 rounded-lg border border-border bg-secondary/40 text-xs space-y-1 min-w-[180px]">
                    <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                      <span>STEP {step.stepNumber}</span>
                      <span className="uppercase text-vine font-bold">{step.type}</span>
                    </div>
                    <div className="font-semibold text-foreground">{step.title}</div>
                    {step.subject && (
                      <div className="text-[10px] text-muted-foreground truncate">
                        {step.subject}
                      </div>
                    )}
                    {step.delayDays && (
                      <div className="text-[10px] text-amber-400 font-mono">
                        Wait {step.delayDays} Days
                      </div>
                    )}
                  </div>
                  {idx < camp.steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
