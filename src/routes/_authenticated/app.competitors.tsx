import { createFileRoute } from "@tanstack/react-router";
import { CompetitorAnalysisModule } from "@/modules/competitor-analysis/CompetitorAnalysisModule";

export const Route = createFileRoute("/_authenticated/app/competitors")({
  component: CompetitorAnalysisModule,
});
