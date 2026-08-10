// Opportunity scoring — single source of truth, reused by the Opportunity
// Scores page and by the bulk scanner (which re-scores each lead immediately).

export type ScorableLead = {
  has_website?: boolean | null;
  site_score?: number | null;
  seo_score?: number | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  phone?: string | null;
};

export function scoreOneLead(lead: ScorableLead): { score: number; label: string } {
  let score = 0;

  // No website at all is the strongest signal.
  if (!lead.has_website) score += 45;
  else {
    const site = lead.site_score;
    const seo = lead.seo_score;
    if (typeof site === "number") score += Math.round(((100 - site) / 100) * 25);
    if (typeof seo === "number") score += Math.round(((100 - seo) / 100) * 20);
  }

  // Established, busy businesses are worth more.
  const reviews = lead.user_ratings_total ?? 0;
  if (reviews >= 200) score += 20;
  else if (reviews >= 50) score += 14;
  else if (reviews >= 10) score += 8;
  else if (reviews > 0) score += 4;

  const rating = lead.rating ?? 0;
  if (rating >= 4.5) score += 10;
  else if (rating >= 4.0) score += 7;
  else if (rating >= 3.0) score += 3;

  // Reachable leads convert.
  if (lead.phone) score += 5;

  score = Math.max(0, Math.min(100, score));
  const label = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";
  return { score, label };
}
