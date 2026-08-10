import { useState } from "react";
import { generatePersonalizedColdEmail } from "./emailGenerator.service";
import { GeneratedEmailPitch } from "../types";
import { Mail, Sparkles, Copy, Send, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function EmailGeneratorModule() {
  const [businessName, setBusinessName] = useState<string>("Apex Plumbing");
  const [websiteUrl, setWebsiteUrl] = useState<string>("apexplumbingdemo.com");
  const [tone, setTone] = useState<GeneratedEmailPitch["tone"]>("consultative");
  const [email, setEmail] = useState<GeneratedEmailPitch>(
    generatePersonalizedColdEmail(
      "Apex Plumbing",
      "apexplumbingdemo.com",
      "Austin",
      "consultative",
    ),
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    setEmail(generatePersonalizedColdEmail(businessName, websiteUrl, "Austin", tone));
    toast.success("Generated 100% custom cold pitch email!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${email.subjectLine}\n\n${email.bodyText}`);
    toast.success("Copied email subject & body to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 10</div>
        <h1 className="font-display text-3xl font-bold mb-2">AI Cold Email Generator</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Generates personalized, non-templated cold pitch emails referencing target site bugs,
          mobile UX gaps, and industry-specific redesign value props.
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-4"
      >
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business Name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="Website URL"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as GeneratedEmailPitch["tone"])}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
        >
          <option value="consultative">Consultative & Helpful</option>
          <option value="direct">Direct Audit Proposal</option>
          <option value="video_teaser">90-Sec Video Teaser</option>
          <option value="wireframe_pitch">Wireframe Concept Pitch</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" /> Generate AI Pitch
        </button>
      </form>

      {/* Generated Email Editor Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Mail className="h-4 w-4 text-vine" /> Custom Email Pitch for {email.leadName}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Text
            </button>
            <button
              onClick={() => toast.success("Pitch queued in Campaign Sequence!")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-vine text-background text-xs font-bold hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" /> Send Outreach
            </button>
          </div>
        </div>

        {/* Subject line field */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-muted-foreground uppercase">Subject Line:</label>
          <input
            type="text"
            value={email.subjectLine}
            onChange={(e) => setEmail((prev) => ({ ...prev, subjectLine: e.target.value }))}
            className="w-full font-mono text-xs font-semibold rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        {/* Body text area */}
        <div className="space-y-1">
          <label className="text-xs font-mono text-muted-foreground uppercase">Email Body:</label>
          <textarea
            rows={10}
            value={email.bodyText}
            onChange={(e) => setEmail((prev) => ({ ...prev, bodyText: e.target.value }))}
            className="w-full text-xs font-sans leading-relaxed rounded-md border border-border bg-background p-4"
          />
        </div>

        {/* Audit Highlights Referenced */}
        <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 space-y-1.5 text-xs">
          <span className="font-semibold text-vine block">Site Audit Triggers Referenced:</span>
          <div className="flex flex-wrap gap-2">
            {email.keyIssuesHighlighted.map((issue, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-card border border-border text-[11px] font-mono text-muted-foreground"
              >
                • {issue}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
