import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/opportunity-scores")({
  head: () => ({ meta: [{ title: "Opportunity Scores — LeadVine" }] }),
  component: OpportunityScores,
});

function OpportunityScores() {
  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Prioritization</div>
        <h1 className="font-display text-4xl">Opportunity Scores</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Opportunity scoring is coming soon.</p>
      </div>
    </div>
  );
}
