import { CompetitorBenchmark } from "../types";

export function findLocalCompetitors(
  businessName: string,
  category = "Plumbing",
): CompetitorBenchmark[] {
  return [
    {
      competitorName: `${category} Pros Direct`,
      website: "pros-direct.com",
      googleRating: 4.9,
      reviewCount: 312,
      designGrade: "A+ Modern",
      pageSpeedScore: 92,
      seoScore: 95,
      techStack: ["Next.js", "Tailwind", "Cloudflare"],
    },
    {
      competitorName: `Premier ${category} Group`,
      website: "premiergroup.co",
      googleRating: 4.7,
      reviewCount: 184,
      designGrade: "B+ Clean",
      pageSpeedScore: 78,
      seoScore: 84,
      techStack: ["WordPress", "Elementor", "GA4"],
    },
    {
      competitorName: `Target Lead (${businessName})`,
      website: "targetclientdemo.com",
      googleRating: 3.8,
      reviewCount: 22,
      designGrade: "D Outdated",
      pageSpeedScore: 34,
      seoScore: 41,
      techStack: ["Legacy PHP", "jQuery 1.12"],
    },
  ];
}
