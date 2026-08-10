import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyPlacesApiKey } from "@/lib/leadvine/places.functions";
import { CheckCircle2, XCircle, Loader2, Circle, ExternalLink } from "lucide-react";

type Status = "idle" | "checking" | "ok" | "fail";

const steps = [
  {
    title: "Enable 'Places API (New)'",
    detail:
      "In Google Cloud Console → APIs & Services → Library, search for 'Places API (New)' and click Enable on the same project that owns the key.",
    href: "https://console.cloud.google.com/apis/library/places.googleapis.com",
  },
  {
    title: "Enable billing on the project",
    detail:
      "Places API requires an active billing account. Go to Billing and link one to the project — new keys 400/403 until this is done.",
    href: "https://console.cloud.google.com/billing",
  },
  {
    title: "Remove Application restrictions (or set to 'None')",
    detail:
      "Under Credentials → your API key → Application restrictions, choose 'None'. HTTP-referrer restrictions do not work here because the request is made server-side, not from the browser.",
    href: "https://console.cloud.google.com/apis/credentials",
  },
  {
    title: "Add 'Places API (New)' to API restrictions",
    detail:
      "Under Credentials → your API key → API restrictions, either allow all APIs or explicitly include 'Places API (New)'. A key restricted to only the legacy Places API will be rejected.",
    href: "https://console.cloud.google.com/apis/credentials",
  },
  {
    title: "Copy the exact key value and re-save it here",
    detail:
      "Paste the key exactly as shown in Google Cloud — no whitespace, quotes, or 'AIza…' truncation. Then re-run the check below.",
  },
] as const;

export function PlacesApiDiagnostics() {
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState<string | null>(null);
  const verify = useServerFn(verifyPlacesApiKey);

  const run = async () => {
    setStatus("checking");
    setReason(null);
    try {
      const res = await verify();
      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("fail");
        setReason(res.reason);
      }
    } catch (e) {
      setStatus("fail");
      setReason(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const showChecklist = status === "fail";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Integrations
          </div>
          <h2 className="font-display text-2xl">Google Places API</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Verify your Places API key is configured and accepted.
          </p>
        </div>
        <button
          onClick={run}
          disabled={status === "checking"}
          className="bg-vine text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {status === "checking" ? "Checking…" : "Run check"}
        </button>
      </div>

      {status === "checking" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Contacting Google Places…
        </div>
      )}

      {status === "ok" && (
        <div className="flex items-start gap-3 rounded-md border border-vine/30 bg-vine/5 p-4">
          <CheckCircle2 className="w-5 h-5 text-vine shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium">Key accepted</div>
            <div className="text-sm text-muted-foreground">
              Places API responded successfully. You're good to search.
            </div>
          </div>
        </div>
      )}

      {status === "fail" && (
        <>
          <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 mb-4">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-medium">Verification failed</div>
              {reason && <div className="text-sm text-muted-foreground break-words">{reason}</div>}
            </div>
          </div>

          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Fix checklist
          </div>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {i + 1}. {s.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.detail}</div>
                  {"href" in s && s.href && (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-vine hover:underline mt-1"
                    >
                      Open in Google Cloud <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {!showChecklist && status !== "ok" && status !== "checking" && (
        <p className="text-xs text-muted-foreground">
          Runs a minimal Places API call using your saved{" "}
          <code className="text-foreground">GOOGLE_PLACES_API_KEY</code>. Nothing is charged for a
          rejected request.
        </p>
      )}
    </div>
  );
}
