import { useState } from "react";
import { Monitor, Tablet, Smartphone, Camera, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

export function ScreenshotServiceModule() {
  const [targetUrl, setTargetUrl] = useState<string>("https://apexplumbingdemo.com");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const viewportWidths = {
    desktop: "w-full max-w-4xl h-[500px]",
    tablet: "w-[600px] h-[500px] mx-auto",
    mobile: "w-[360px] h-[520px] mx-auto",
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 13</div>
        <h1 className="font-display text-3xl font-bold mb-2">Screenshot Service</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Multi-viewport visual renderer for Desktop (1920x1080), Tablet (768x1024), and Mobile
          (375x812) to embed inside audit reports and client pitch presentations.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewport === "desktop"
                ? "bg-vine text-background font-semibold"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-4 w-4" /> Desktop
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewport === "tablet"
                ? "bg-vine text-background font-semibold"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tablet className="h-4 w-4" /> Tablet
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewport === "mobile"
                ? "bg-vine text-background font-semibold"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-4 w-4" /> Mobile
          </button>
        </div>

        <button
          onClick={() => toast.success("Captured viewport snapshot for pitch report!")}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary/80"
        >
          <Camera className="h-4 w-4 text-vine" /> Capture Snapshot
        </button>
      </div>

      {/* Frame Renderer */}
      <div className="rounded-2xl border border-border bg-card p-8 flex justify-center items-center overflow-hidden">
        <div
          className={`transition-all duration-300 border-4 border-muted rounded-2xl overflow-hidden shadow-2xl bg-background ${viewportWidths[viewport]}`}
        >
          <div className="bg-muted/60 px-4 py-2 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            </div>
            <span className="truncate max-w-xs">{targetUrl}</span>
            <a href={targetUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5 hover:text-vine" />
            </a>
          </div>
          <iframe
            src={targetUrl}
            title="Website Preview"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
