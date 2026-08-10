import { useState } from "react";
import { Save, Building, Palette, Mail, Shield, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function SettingsBrandingModule() {
  const [agencyName, setAgencyName] = useState("LeadVine Web Partners");
  const [primaryColor, setPrimaryColor] = useState("#064E3B");
  const [defaultContractPrice, setDefaultContractPrice] = useState(5000);
  const [emailSenderName, setEmailSenderName] = useState("Alex River (LeadVine Web Design)");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Saved Agency Branding & System Settings!");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 18</div>
        <h1 className="font-display text-3xl font-bold mb-2">
          Agency Settings & White-Label Branding
        </h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Configure agency profile details, white-label PDF audit themes, default proposal pricing
          tiers, and outreach signature preferences.
        </p>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="rounded-xl border border-border bg-card p-6 space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">
              Agency Company Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">
              White-Label Brand Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-12 rounded border border-border bg-background cursor-pointer"
              />
              <span className="font-mono text-xs">{primaryColor}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">
              Default Target Web Deal Price ($)
            </label>
            <input
              type="number"
              value={defaultContractPrice}
              onChange={(e) => setDefaultContractPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">
              Default Cold Email Outreach Sender Name
            </label>
            <input
              type="text"
              value={emailSenderName}
              onChange={(e) => setEmailSenderName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-vine px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          <Save className="h-4 w-4" /> Save Agency Preferences
        </button>
      </form>
    </div>
  );
}
