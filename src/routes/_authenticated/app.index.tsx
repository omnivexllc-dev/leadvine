import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Gauge, LineChart, ArrowUpRight } from "lucide-react";
import { TodayPanel } from "@/components/app/TodayPanel";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Dashboard — LeadVine" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [lists, leads, audits, reports] = await Promise.all([
        supabase.from("lead_lists").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("site_audits").select("id", { count: "exact", head: true }),
        supabase.from("seo_reports").select("id", { count: "exact", head: true }),
      ]);
      return {
        lists: lists.count ?? 0,
        leads: leads.count ?? 0,
        audits: audits.count ?? 0,
        reports: reports.count ?? 0,
      };
    },
  });

  const { data: recentAudits } = useQuery({
    queryKey: ["recent-audits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_audits")
        .select("id, url, score, created_at, needs_redesign")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div>
      <div className="mb-10">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Overview</div>
        <h1 className="font-display text-4xl">Dashboard</h1>
      </div>

      <TodayPanel />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Lead lists" value={stats?.lists ?? 0} />
        <Stat label="Leads saved" value={stats?.leads ?? 0} />
        <Stat label="Site audits" value={stats?.audits ?? 0} />
        <Stat label="SEO reports" value={stats?.reports ?? 0} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <ToolCard
          to="/app/find-leads"
          icon={Search}
          title="Find leads"
          desc="Discover businesses without websites."
        />
        <ToolCard
          to="/app/audit-sites"
          icon={Gauge}
          title="Audit sites"
          desc="Score sites for redesign potential."
        />
        <ToolCard
          to="/app/seo-audit"
          icon={LineChart}
          title="SEO audit"
          desc="Generate SEO reports on demand."
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent site audits</h2>
          <Link to="/app/audit-sites" className="text-xs text-vine hover:underline">
            Run new →
          </Link>
        </div>
        {!recentAudits || recentAudits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No audits yet. Try one from the Audit Sites page.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {recentAudits.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm">{a.url}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <ScoreBadge score={a.score ?? 0} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  );
}

function ToolCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-5 hover:border-vine/60 group transition-colors"
    >
      <Icon className="h-6 w-6 text-vine mb-3" />
      <div className="flex items-center justify-between">
        <div className="font-display text-lg">{title}</div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-vine" />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </Link>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-vine bg-vine/15"
      : score >= 60
        ? "text-yellow-400 bg-yellow-400/15"
        : "text-red-400 bg-red-400/15";
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{score}</span>;
}
