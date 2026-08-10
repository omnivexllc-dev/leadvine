import { createFileRoute } from "@tanstack/react-router";
import { AiAnalyzerModule } from "@/modules/ai-analyzer/AiAnalyzerModule";

export const Route = createFileRoute("/_authenticated/app/ai-analyzer")({
  component: AiAnalyzerModule,
});
