import { Link, useRouter } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Search,
  Gauge,
  LineChart,
  List,
  Settings,
  LogOut,
  Grape,
  Menu,
  TrendingUp,
  Sparkles,
  Radar,
  UploadCloud,
  Globe,
  Cpu,
  Flame,
  Palette,
  Users,
  Award,
  Mail,
  Send,
  FileText,
  Camera,
  BarChart3,
  Presentation,
  FileCode,
  Zap,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface NavGroup {
  category: string;
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navGroups: NavGroup[] = [
  {
    category: "Main",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/pipeline", label: "9-Stage Pipeline", icon: TrendingUp },
      { to: "/app/find-leads", label: "Find leads", icon: Search },
      { to: "/app/assistant", label: "AI assistant", icon: Sparkles },
    ],
  },
  {
    category: "Prospecting & Import",
    items: [
      { to: "/app/import", label: "Import Center", icon: UploadCloud },
      { to: "/app/bulk-scanner", label: "Bulk AI Scanner", icon: Radar },
      { to: "/app/domain-intel", label: "Domain Intelligence", icon: Globe },
      { to: "/app/tech-detector", label: "Tech Detector", icon: Cpu },
      { to: "/app/lead-ranks", label: "Lead Prioritization", icon: Award },
    ],
  },
  {
    category: "Audit & Redesign Studio",
    items: [
      { to: "/app/ai-analyzer", label: "AI Website Analyzer", icon: Gauge },
      { to: "/app/opportunity-engine", label: "Opportunity Engine", icon: Flame },
      { to: "/app/redesign-studio", label: "AI Redesign Studio", icon: Palette },
      { to: "/app/competitors", label: "Competitor Analysis", icon: Users },
      { to: "/app/screenshots", label: "Screenshot Service", icon: Camera },
    ],
  },
  {
    category: "Outreach & Sales",
    items: [
      { to: "/app/email-generator", label: "AI Cold Emailer", icon: Mail },
      { to: "/app/email-campaigns", label: "Drip Campaigns", icon: Send },
      { to: "/app/proposals", label: "Proposal Generator", icon: FileText },
      { to: "/app/pitch-decks", label: "AI Pitch Decks", icon: Presentation },
    ],
  },
  {
    category: "Agency Ops & White Label",
    items: [
      { to: "/app/analytics", label: "Agency Analytics", icon: BarChart3 },
      { to: "/app/white-label", label: "White-Label Reports", icon: FileCode },
      { to: "/app/crm-sync", label: "CRM Integration", icon: Zap },
      { to: "/app/agency-settings", label: "Agency Settings", icon: Building },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar p-5 flex-col gap-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex overflow-y-auto",
          open ? "flex translate-x-0" : "hidden -translate-x-full",
        )}
      >
        <Link to="/" className="flex items-center gap-2 mb-2">
          <Grape className="h-6 w-6 text-vine" />
          <span className="font-display text-xl font-bold">LeadVine</span>
        </Link>

        <nav className="flex-1 flex flex-col gap-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                {group.category}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/app" }}
                  activeProps={{ className: "bg-vine/15 text-vine font-semibold" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  }}
                  className="flex items-center gap-3 rounded-md px-2.5 py-1.5 text-xs transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-t border-border mt-2 pt-3"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Grape className="h-5 w-5 text-vine" />
            <span className="font-display font-bold">LeadVine</span>
          </Link>
          <button onClick={() => setOpen((o) => !o)} className="p-2">
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
