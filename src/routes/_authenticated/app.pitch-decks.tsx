import { createFileRoute } from "@tanstack/react-router";
import { PitchDeckModule } from "@/modules/pitch-deck/PitchDeckModule";

export const Route = createFileRoute("/_authenticated/app/pitch-decks")({
  component: PitchDeckModule,
});
