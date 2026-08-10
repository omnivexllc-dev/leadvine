import { createFileRoute } from "@tanstack/react-router";
import { EmailCampaignsModule } from "@/modules/email-campaigns/EmailCampaignsModule";

export const Route = createFileRoute("/_authenticated/app/email-campaigns")({
  component: EmailCampaignsModule,
});
