import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  Search,
  Globe,
  Mail,
  Calendar,
  Trophy,
  AlertTriangle,
  Flame,
} from "lucide-react";

export function DashboardAnalyticsModule() {
  const chartData = [
    { month: "May", leads: 45, pitchSent: 28, meetings: 6, won: 2 },
    { month: "Jun", leads: 82, pitchSent: 54, meetings: 12, won: 5 },
    { month: "Jul", leads: 130, pitchSent: 92, meetings: 21, won: 9 },
    { month: "Aug", leads: 185, pitchSent: 140, meetings: 34, won: 15 },
  ];

  const pieData = [
    { name: "★★★★★ Hot Redesign Targets", value: 42, color: "#064E3B" },
    { name: "★★★★☆ Strong Opportunities", value: 68, color: "#059669" },
    { name: "Expired / Unregistered Domains", value: 18, color: "#D97706" },
    { name: "Broken / Down Websites", value: 14, color: "#E11D48" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 14</div>
        <h1 className="font-display text-3xl font-bold mb-2">Agency Operations Dashboard</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Comprehensive web design agency executive command hub tracking prospect volume, scan
          breakdowns, campaign response funnels, deals closed, and estimated pipeline revenue.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
            <span>Imported & Found Leads</span>
            <Search className="h-4 w-4 text-vine" />
          </div>
          <div className="text-3xl font-bold font-mono">459</div>
          <div className="text-[11px] text-emerald-400 font-semibold">+34% this month</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
            <span>Redesign Opportunities</span>
            <Flame className="h-4 w-4 text-vine" />
          </div>
          <div className="text-3xl font-bold font-mono text-vine">128</div>
          <div className="text-[11px] text-muted-foreground">5-Star & 4-Star Prospects</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
            <span>Meetings Scheduled</span>
            <Calendar className="h-4 w-4 text-vine" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">34</div>
          <div className="text-[11px] text-emerald-400 font-semibold">18.5% pitch-to-meeting</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
            <span>Closed Web Deals Revenue</span>
            <Trophy className="h-4 w-4 text-vine" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">$84,500</div>
          <div className="text-[11px] text-muted-foreground">Avg $5,600 per website deal</div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold font-mono uppercase text-muted-foreground">
            Agency Sales Funnel Growth
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                  }}
                />
                <Bar dataKey="leads" fill="#064E3B" radius={[4, 4, 0, 0]} name="Leads Scanned" />
                <Bar dataKey="pitchSent" fill="#059669" radius={[4, 4, 0, 0]} name="Pitches Sent" />
                <Bar
                  dataKey="meetings"
                  fill="#D97706"
                  radius={[4, 4, 0, 0]}
                  name="Meetings Booked"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold font-mono uppercase text-muted-foreground">
            Prospect Breakdown
          </h3>
          <div className="h-48 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center font-mono">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
