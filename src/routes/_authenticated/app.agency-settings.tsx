import { createFileRoute } from "@tanstack/react-router";
import { SettingsBrandingModule } from "@/modules/settings-branding/SettingsBrandingModule";

export const Route = createFileRoute("/_authenticated/app/agency-settings")({
  component: SettingsBrandingModule,
});
