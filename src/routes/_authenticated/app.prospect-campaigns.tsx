import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/prospect-campaigns")({
  head: () => ({ meta: [{ title: "Prospect Campaigns — LeadVine" }] }),
  component: ProspectCampaigns,
});

function ProspectCampaigns() {
  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Campaigns</div>
        <h1 className="font-display text-4xl">Prospect Campaigns</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Campaign management is coming soon. Use Lead Lists to organize prospects for now.
        </p>
      </div>
    </div>
  );
}
