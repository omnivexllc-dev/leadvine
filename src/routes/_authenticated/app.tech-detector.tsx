import { createFileRoute } from "@tanstack/react-router";
import { TechDetectorModule } from "@/modules/tech-detector/TechDetectorModule";

export const Route = createFileRoute("/_authenticated/app/tech-detector")({
  component: TechDetectorModule,
});
