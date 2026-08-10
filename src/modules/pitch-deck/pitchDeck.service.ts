import { SlideDeck } from "../types";

export function generatePitchDeck(clientName: string, websiteUrl: string): SlideDeck {
  return {
    id: `deck-${Date.now()}`,
    clientName,
    websiteUrl,
    slides: [
      {
        slideNumber: 1,
        title: `Digital Presence & Web Growth Strategy`,
        subtitle: `Prepared specifically for ${clientName}`,
        content: `A comprehensive analysis of current web conversion metrics, mobile user experience, and competitive positioning.`,
        type: "title",
      },
      {
        slideNumber: 2,
        title: `The Problem: Conversion Friction on ${websiteUrl}`,
        subtitle: `3 Key Issues Bottlenecking Local Inbound Leads`,
        content: `1. Slow mobile page load times (exceeding 3.2s LCP)\n2. Non-responsive mobile layout causing horizontal overflow\n3. Lacks instant online appointment booking & SSL trust badges`,
        type: "problem",
      },
      {
        slideNumber: 3,
        title: `Local Competitor Benchmark Gap`,
        subtitle: `Where ${clientName} Stands Against Local Rivals`,
        content: `Top competitors are utilizing fast Next.js architectures with integrated booking widgets and 4.8+ Google Star ratings. Upgrading your web infrastructure will reclaim local search authority.`,
        type: "competitors",
      },
      {
        slideNumber: 4,
        title: `Proposed AI Redesign Wireframe Concept`,
        subtitle: `Modern, Fast, Mobile-First Web Experience`,
        content: `Features high-impact hero copy, sticky mobile click-to-call buttons, interactive quote wizard, and automated Google Reviews social proof.`,
        type: "wireframe",
      },
      {
        slideNumber: 5,
        title: `Investment & Delivery Timeline`,
        subtitle: `3-Week Turnkey Web Redesign Implementation`,
        content: `Total Investment: $5,500 (Growth Tier including 1-year hosting, speed optimization, and custom booking integration).`,
        type: "investment",
      },
    ],
  };
}
