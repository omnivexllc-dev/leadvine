import { createFileRoute } from "@tanstack/react-router";
import { ImportCenterModule } from "@/modules/import-center/ImportCenterModule";

export const Route = createFileRoute("/_authenticated/app/import")({
  component: ImportCenterModule,
});
