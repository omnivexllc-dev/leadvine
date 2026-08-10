import { createFileRoute } from "@tanstack/react-router";
import { RedesignStudioModule } from "@/modules/redesign-studio/RedesignStudioModule";

export const Route = createFileRoute("/_authenticated/app/redesign-studio")({
  component: RedesignStudioModule,
});
