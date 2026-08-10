import { createFileRoute } from "@tanstack/react-router";
import { ScreenshotServiceModule } from "@/modules/screenshot-service/ScreenshotServiceModule";

export const Route = createFileRoute("/_authenticated/app/screenshots")({
  component: ScreenshotServiceModule,
});
