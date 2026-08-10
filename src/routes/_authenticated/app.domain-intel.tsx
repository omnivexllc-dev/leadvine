import { createFileRoute } from "@tanstack/react-router";
import { DomainIntelligenceModule } from "@/modules/domain-intelligence/DomainIntelligenceModule";

export const Route = createFileRoute("/_authenticated/app/domain-intel")({
  component: DomainIntelligenceModule,
});
