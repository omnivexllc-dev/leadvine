import { useState } from "react";
import { analyzeDomainIntelligence } from "./domainIntelligence.service";
import { DomainIntelligence } from "../types";
import {
  Globe,
  Search,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Server,
  Star,
  ArrowUpRight,
} from "lucide-react";

export function DomainIntelligenceModule() {
  const [domainInput, setDomainInput] = useState<string>("apexplumbingdemo.com");
  const [data, setData] = useState<DomainIntelligence>(
    analyzeDomainIntelligence("apexplumbingdemo.com"),
  );

  const handleInspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setData(analyzeDomainIntelligence(domainInput));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 3</div>
        <h1 className="font-display text-3xl font-bold mb-2">Domain Intelligence</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Deep WHOIS, DNS, registrar & hosting provider analysis. Flags expired or expiring domains
          automatically as High Opportunity agency targets.
        </p>
      </div>

      <form
        onSubmit={handleInspect}
        className="rounded-xl border border-border bg-card p-4 flex gap-3"
      >
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="Enter domain name e.g. vanguardlaw.co"
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Search className="h-4 w-4" /> Inspect Domain
        </button>
      </form>

      {/* Domain Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-mono">Domain Status</span>
            {data.status === "expired" ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-semibold">
                EXPIRED
              </span>
            ) : data.status === "expiring_soon" ? (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold">
                EXPIRING SOON
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold">
                ACTIVE
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold font-mono">{data.domain}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Domain Age: {data.domainAgeYears} years old
            </p>
          </div>

          {data.isHighOpportunity && (
            <div className="rounded-lg bg-vine/10 border border-vine/20 p-3 flex items-center gap-2 text-vine text-xs font-semibold">
              <Star className="h-4 w-4 fill-current shrink-0" />
              ★★★★★ High Opportunity (Domain Needs Immediate Renewal / Setup)
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-vine" /> Registration & SSL
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Registrar:</span>
              <span className="font-medium">{data.registrar}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Expiration Date:</span>
              <span className="font-mono">{data.expirationDate}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">SSL Security:</span>
              <span
                className={
                  data.hasSsl ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"
                }
              >
                {data.hasSsl ? "Valid (TLS 1.3)" : "Missing / Invalid"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-vine" /> Infrastructure & CDN
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Hosting Provider:</span>
              <span className="font-medium">{data.hostingProvider}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">CDN Layer:</span>
              <span className="font-medium">{data.cdn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Redirect Health:</span>
              <span className="text-emerald-400">Direct Resolution</span>
            </div>
          </div>
        </div>
      </div>

      {/* DNS Records Panel */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold font-mono uppercase tracking-wider text-muted-foreground">
          DNS Zone Record Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-secondary/60 text-muted-foreground uppercase">
              <tr>
                <th className="p-2">Record Type</th>
                <th className="p-2">Resolved Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.dnsRecords?.map((dns, idx) => (
                <tr key={idx} className="hover:bg-secondary/30">
                  <td className="p-2 font-bold text-vine">{dns.type}</td>
                  <td className="p-2 text-foreground">{dns.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
