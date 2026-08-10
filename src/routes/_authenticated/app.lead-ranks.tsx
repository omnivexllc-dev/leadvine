import { createFileRoute } from "@tanstack/react-router";
import { LeadPrioritizationModule } from "@/modules/lead-prioritization/LeadPrioritizationModule";

export const Route = createFileRoute("/_authenticated/app/lead-ranks")({
  component: LeadPrioritizationModule,
});
