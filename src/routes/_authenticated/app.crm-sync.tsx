import { createFileRoute } from "@tanstack/react-router";
import { CrmIntegrationModule } from "@/modules/crm-integration/CrmIntegrationModule";

export const Route = createFileRoute("/_authenticated/app/crm-sync")({
  component: CrmIntegrationModule,
});
