import { useState } from "react";
import { FileCode, Download, Share2, CheckCircle2, Shield, Eye } from "lucide-react";
import { toast } from "sonner";

export function ReportBuilderModule() {
  const [agencyName, setAgencyName] = useState<string>("Apex Growth Partners");
  const [clientName, setClientName] = useState<string>("Vanguard Law Group");
  const [websiteUrl, setWebsiteUrl] = useState<string>("vanguardlaw.co");
  const [shareableUrl, setShareableUrl] = useState<string>("");

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const link = `https://leadvine.app/audit/${encodeURIComponent(clientName.toLowerCase().replace(/\s+/g, "-"))}`;
    setShareableUrl(link);
    toast.success("Generated White-label Audit Report!");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 16</div>
        <h1 className="font-display text-3xl font-bold mb-2">White-Label Report Builder</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Generate custom branded PDF website audit reports with your web agency logo, brand colors,
          custom cover page, and shareable client links.
        </p>
      </div>

      <form
        onSubmit={handleGenerateReport}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Agency Name (White-label Branding)
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Client Business Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Client Website URL</label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-vine px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          <FileCode className="h-4 w-4" /> Build Custom PDF Audit Report
        </button>
      </form>

      {/* Shareable Link Result */}
      {shareableUrl && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <span className="text-xs text-muted-foreground font-mono uppercase">
                Live White-Label Client Link
              </span>
              <div className="text-sm font-mono font-bold text-vine mt-0.5">{shareableUrl}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  toast.success("Copied shareable report link!");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-secondary"
              >
                <Share2 className="h-3.5 w-3.5" /> Copy Link
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-vine text-background text-xs font-bold hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
