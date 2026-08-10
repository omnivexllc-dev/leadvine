import { createFileRoute } from "@tanstack/react-router";
import { ProposalGeneratorModule } from "@/modules/proposal-generator/ProposalGeneratorModule";

export const Route = createFileRoute("/_authenticated/app/proposals")({
  component: ProposalGeneratorModule,
});
