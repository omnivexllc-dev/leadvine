import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline — LeadVine" }] }),
  component: Pipeline,
});

function Pipeline() {
  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Sales</div>
        <h1 className="font-display text-4xl">Pipeline</h1>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Pipeline board is coming soon.</p>
      </div>
    </div>
  );
}
