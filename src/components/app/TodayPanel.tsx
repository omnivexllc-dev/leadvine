import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Flame, RefreshCw, CheckCircle2 } from "lucide-react";

export function TodayPanel() {
  const { data: overdue } = useQuery({
    queryKey: ["today-overdue"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("leads")
        .select("id, name, next_followup_at, pipeline_status")
        .lt("next_followup_at", now)
        .or("pipeline_status.is.null,pipeline_status.not.in.(Won,Lost)")
        .order("next_followup_at", { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: hot } = useQuery({
    queryKey: ["today-hot"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, opportunity_label, pipeline_status")
        .eq("opportunity_label", "Hot")
        .eq("pipeline_status", "New")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: staleCampaigns } = useQuery({
    queryKey: ["today-stale-campaigns"],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      const { data } = await supabase
        .from("lead_lists")
        .select("id, name, last_run_at, created_at")
        .or(`last_run_at.lt.${cutoff.toISOString()},last_run_at.is.null`)
        .order("last_run_at", { ascending: true, nullsFirst: true })
        .limit(5);
      return data ?? [];
    },
  });

  const hasOverdue = (overdue?.length ?? 0) > 0;
  const hasHot = (hot?.length ?? 0) > 0;
  const hasStale = (staleCampaigns?.length ?? 0) > 0;
  const allClear = !hasOverdue && !hasHot && !hasStale;

  return (
    <div className="mb-10 space-y-4">
      <div className="text-xs uppercase tracking-widest text-vine mb-2">Today</div>
      <div className="grid md:grid-cols-3 gap-4">
        {hasOverdue && (
          <TodayCard
            icon={AlertCircle}
            tone="red"
            title="Overdue follow-ups"
            count={overdue!.length}
            linkTo="/app/pipeline"
            linkLabel="Go to Pipeline"
          >
            <ul className="space-y-2">
              {overdue!.map((lead) => (
                <li key={lead.id} className="text-sm flex items-start justify-between gap-3">
                  <span className="truncate">{lead.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {lead.next_followup_at
                      ? new Date(lead.next_followup_at).toLocaleDateString()
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </TodayCard>
        )}

        {hasHot && (
          <TodayCard
            icon={Flame}
            tone="orange"
            title="Hot leads, not contacted yet"
            count={hot!.length}
            linkTo="/app/opportunity-scores"
            linkLabel="View Opportunity Scores"
          >
            <ul className="space-y-2">
              {hot!.map((lead) => (
                <li key={lead.id} className="text-sm flex items-center justify-between gap-3">
                  <span className="truncate">{lead.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 shrink-0">
                    Hot
                  </span>
                </li>
              ))}
            </ul>
          </TodayCard>
        )}

        {hasStale && (
          <TodayCard
            icon={RefreshCw}
            tone="vine"
            title="Campaigns worth refreshing"
            count={staleCampaigns!.length}
            linkTo="/app/prospect-campaigns"
            linkLabel="Open Prospect Campaigns"
          >
            <ul className="space-y-2">
              {staleCampaigns!.map((campaign) => (
                <li key={campaign.id} className="text-sm flex items-start justify-between gap-3">
                  <span className="truncate">{campaign.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {campaign.last_run_at
                      ? new Date(campaign.last_run_at).toLocaleDateString()
                      : "Never run"}
                  </span>
                </li>
              ))}
            </ul>
          </TodayCard>
        )}
      </div>

      {allClear && (
        <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-vine shrink-0" />
          <div>
            <div className="font-display text-lg">You&apos;re all caught up</div>
            <p className="text-sm text-muted-foreground">
              No overdue follow-ups, hot leads, or stale campaigns right now.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TodayCard({
  icon: Icon,
  tone,
  title,
  count,
  linkTo,
  linkLabel,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "red" | "orange" | "vine";
  title: string;
  count: number;
  linkTo: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  const toneClasses = {
    red: "text-red-400 bg-red-400/15",
    orange: "text-orange-400 bg-orange-400/15",
    vine: "text-vine bg-vine/15",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-5 w-5 p-1 rounded-full ${toneClasses[tone]}`} />
          <h3 className="font-display text-lg">{title}</h3>
        </div>
        <span className="font-display text-xl">{count}</span>
      </div>
      <div className="flex-1 mb-4">{children}</div>
      <Link to={linkTo} className="text-xs text-vine hover:underline mt-auto">
        {linkLabel} →
      </Link>
    </div>
  );
}
