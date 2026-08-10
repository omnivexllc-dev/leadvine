import { createFileRoute } from "@tanstack/react-router";
import { DashboardAnalyticsModule } from "@/modules/dashboard-analytics/DashboardAnalyticsModule";

export const Route = createFileRoute("/_authenticated/app/analytics")({
  component: DashboardAnalyticsModule,
});
