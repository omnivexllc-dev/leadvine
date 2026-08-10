import { useState } from "react";
import { RefreshCw, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface CrmPlatform {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  leadCountSynced: number;
}

export function CrmIntegrationModule() {
  const [crms, setCrms] = useState<CrmPlatform[]>([
    { id: "ghl", name: "GoHighLevel (GHL)", logo: "🚀", connected: true, leadCountSynced: 124 },
    { id: "hubspot", name: "HubSpot CRM", logo: "🟠", connected: false, leadCountSynced: 0 },
    { id: "pipedrive", name: "Pipedrive", logo: "🟢", connected: true, leadCountSynced: 48 },
    { id: "salesforce", name: "Salesforce", logo: "☁️", connected: false, leadCountSynced: 0 },
    { id: "zapier", name: "Zapier Webhooks", logo: "⚡", connected: true, leadCountSynced: 210 },
  ]);

  const toggleConnect = (id: string) => {
    setCrms((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.connected;
          toast.success(`${nextState ? "Connected" : "Disconnected"} ${c.name}!`);
          return { ...c, connected: nextState };
        }
        return c;
      }),
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 17</div>
        <h1 className="font-display text-3xl font-bold mb-2">Agency CRM Integration Hub</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Auto-sync high-value website prospects, redesign audits, and opportunity scores directly
          to GoHighLevel (GHL), HubSpot, Pipedrive, Salesforce, and Zapier.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {crms.map((crm) => (
          <div
            key={crm.id}
            className="rounded-xl border border-border bg-card p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl">{crm.logo}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    crm.connected
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {crm.connected ? "Active Sync" : "Not Connected"}
                </span>
              </div>
              <h2 className="font-bold text-lg">{crm.name}</h2>
              {crm.connected && (
                <p className="text-xs text-muted-foreground font-mono">
                  {crm.leadCountSynced} Prospects Synced to Pipelines
                </p>
              )}
            </div>

            <button
              onClick={() => toggleConnect(crm.id)}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                crm.connected
                  ? "bg-secondary border border-border text-foreground hover:bg-destructive/20 hover:text-destructive"
                  : "bg-vine text-background hover:opacity-90"
              }`}
            >
              {crm.connected ? "Disconnect Integration" : "Connect Account"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
