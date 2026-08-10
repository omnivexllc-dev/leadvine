import { createFileRoute } from "@tanstack/react-router";
import { EmailGeneratorModule } from "@/modules/email-generator/EmailGeneratorModule";

export const Route = createFileRoute("/_authenticated/app/email-generator")({
  component: EmailGeneratorModule,
});
