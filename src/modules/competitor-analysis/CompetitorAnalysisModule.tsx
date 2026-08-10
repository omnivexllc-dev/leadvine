import { useState } from "react";
import { findLocalCompetitors } from "./competitorAnalysis.service";
import { CompetitorBenchmark } from "../types";
import { Users, Search, Award, TrendingDown, Star, Download } from "lucide-react";
import { toast } from "sonner";

export function CompetitorAnalysisModule() {
  const [targetName, setTargetName] = useState<string>("Apex Plumbing");
  const [category, setCategory] = useState<string>("Plumbing");
  const [competitors, setCompetitors] = useState<CompetitorBenchmark[]>(
    findLocalCompetitors("Apex Plumbing", "Plumbing"),
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCompetitors(findLocalCompetitors(targetName, category));
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-vine mb-1">Module 8</div>
        <h1 className="font-display text-3xl font-bold mb-2">Competitor Analysis</h1>
        <p className="text-muted-foreground text-sm max-w-3xl">
          Side-by-side local benchmark comparing target client against top competitors on Google
          Reviews, PageSpeed, SEO, and Design quality.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-3"
      >
        <input
          type="text"
          value={targetName}
          onChange={(e) => setTargetName(e.target.value)}
          placeholder="Target Business Name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Industry / Niche"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-vine px-5 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <Search className="h-4 w-4" /> Compare Local Competitors
        </button>
      </form>

      {/* Comparison Matrix Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden space-y-4 p-5">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-vine" /> Competitor Benchmark Matrix
          </h3>
          <button
            onClick={() => toast.success("Exported Competitor Gap Analysis Report!")}
            className="text-xs text-vine hover:underline flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" /> Download Comparison PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/60 text-muted-foreground font-mono uppercase">
              <tr>
                <th className="p-3">Business Name</th>
                <th className="p-3">Google Reviews</th>
                <th className="p-3">Design Quality</th>
                <th className="p-3">PageSpeed</th>
                <th className="p-3">SEO Score</th>
                <th className="p-3">Tech Stack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {competitors.map((comp, idx) => {
                const isTarget = comp.competitorName.includes("Target Lead");
                return (
                  <tr
                    key={idx}
                    className={isTarget ? "bg-rose-500/10 font-medium" : "hover:bg-secondary/30"}
                  >
                    <td className="p-3 font-semibold">
                      {comp.competitorName}
                      {isTarget && (
                        <span className="ml-2 text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                          Target Prospect
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-amber-400 font-mono">
                        <Star className="h-3.5 w-3.5 fill-current" /> {comp.googleRating} (
                        {comp.reviewCount})
                      </div>
                    </td>
                    <td className="p-3 font-mono">{comp.designGrade}</td>
                    <td className="p-3 font-mono">{comp.pageSpeedScore}/100</td>
                    <td className="p-3 font-mono">{comp.seoScore}/100</td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {comp.techStack.join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
