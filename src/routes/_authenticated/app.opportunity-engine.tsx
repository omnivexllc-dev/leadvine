import { createFileRoute } from "@tanstack/react-router";
import { OpportunityEngineModule } from "@/modules/opportunity-engine/OpportunityEngineModule";

export const Route = createFileRoute("/_authenticated/app/opportunity-engine")({
  component: OpportunityEngineModule,
});
