import { useState } from "react";
import { generatePitchDeck } from "./pitchDeck.service";
import { SlideDeck } from "../types";
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Fullscreen,
} from "lucide-react";
import { toast } from "sonner";

export function PitchDeckModule() {
  const [clientName, setClientName] = useState<string>("Sunstate Dental");
  const [websiteUrl, setWebsiteUrl] = useState<string>("sunstatedental.com");
  const [deck, setDeck] = useState<SlideDeck>(
    generatePitchDeck("Sunstate Dental", "sunstatedental.com"),
  );
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    setDeck(generatePitchDeck(clientName, websiteUrl));
    setCurrentSlideIdx(0);
    toast.success(`Generated 5-Slide Presentation Deck for ${clientName}!`);
  };

  const activeSlide = deck.slides[currentSlideIdx];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 15</div>
        <h1 className="font-display text-3xl font-bold mb-2">AI Pitch Deck Generator</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Generates interactive slide decks (Title, Problem, Competitor Benchmark, Wireframe
          Proposal, and Investment) for agency sales meetings.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-3"
      >
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client Name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="Website URL"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Generate Slide Deck
        </button>
      </form>

      {/* Slide Viewer Card */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-2xl min-h-[420px] flex flex-col justify-between">
        <div className="flex justify-between items-center border-b border-border pb-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-vine font-bold">
            <Presentation className="h-4 w-4" /> SLIDE {activeSlide.slideNumber} OF{" "}
            {deck.slides.length}
          </div>
          <div className="text-muted-foreground">{deck.clientName} Presentation</div>
        </div>

        {/* Slide Content View */}
        <div className="space-y-4 max-w-3xl mx-auto text-center my-auto py-8">
          <h2 className="text-3xl font-bold font-display text-foreground leading-tight">
            {activeSlide.title}
          </h2>
          <h3 className="text-sm font-semibold text-vine font-mono">{activeSlide.subtitle}</h3>
          <div className="text-sm text-foreground/90 leading-relaxed font-sans whitespace-pre-line bg-secondary/30 p-6 rounded-xl border border-border/60">
            {activeSlide.content}
          </div>
        </div>

        {/* Slide Controls */}
        <div className="flex justify-between items-center border-t border-border pt-4">
          <button
            onClick={() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentSlideIdx === 0}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-xs font-semibold disabled:opacity-30 hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" /> Previous Slide
          </button>

          <div className="flex items-center gap-2">
            {deck.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIdx(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === currentSlideIdx ? "w-8 bg-vine" : "w-2.5 bg-secondary"}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlideIdx((prev) => Math.min(deck.slides.length - 1, prev + 1))}
            disabled={currentSlideIdx === deck.slides.length - 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-vine text-background text-xs font-bold disabled:opacity-30 hover:opacity-90"
          >
            Next Slide <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
