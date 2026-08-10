import { createFileRoute } from "@tanstack/react-router";
import { ReportBuilderModule } from "@/modules/report-builder/ReportBuilderModule";

export const Route = createFileRoute("/_authenticated/app/white-label")({
  component: ReportBuilderModule,
});
