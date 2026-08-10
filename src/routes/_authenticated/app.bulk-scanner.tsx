import { createFileRoute } from "@tanstack/react-router";
import { BulkScannerModule } from "@/modules/bulk-scanner/BulkScannerModule";

export const Route = createFileRoute("/_authenticated/app/bulk-scanner")({
  component: BulkScannerModule,
});
