import { ProposalDocument } from "../types";

export function createProposalDocument(clientName: string, websiteUrl: string): ProposalDocument {
  return {
    id: `prop-${Date.now()}`,
    clientName,
    websiteUrl,
    agencyName: "LeadVine Agency Partners",
    auditSummary: `Comprehensive web redesign proposal for ${clientName} to address mobile navigation friction, outdated typography, slow page load times, and missing lead conversion forms.`,
    identifiedProblems: [
      "Current website was last updated in 2017 and is non-responsive on modern mobile devices.",
      "Mobile load time exceeds 3.2s causing high bounce rate on local ad traffic.",
      "Lacks online appointment scheduling and instant contact form.",
    ],
    proposedSolutions: [
      "Custom modern web redesign built on ultra-fast React/Next.js architecture.",
      "Mobile-first responsive layout with sticky click-to-call buttons.",
      "Embedded Google Reviews carousel & online booking form.",
    ],
    timelineWeeks: 3,
    investmentTiers: [
      {
        tierName: "Essential Redesign",
        price: 3500,
        deliverables: [
          "Custom 5-Page Website",
          "Mobile Responsiveness",
          "Basic SEO Setup",
          "Contact Form Integration",
        ],
      },
      {
        tierName: "Growth Redesign (Recommended)",
        price: 5500,
        deliverables: [
          "Everything in Essential",
          "Interactive Online Quote Wizard",
          "Google Reviews Integration",
          "Speed Optimization (<1.0s LCP)",
          "1-Year Free Hosting & Maintenance",
        ],
        recommended: true,
      },
      {
        tierName: "Enterprise Growth Suite",
        price: 8900,
        deliverables: [
          "Everything in Growth",
          "Custom Video Production",
          "Local SEO & Google Business Profile Optimization",
          "Automated Lead Nurturing CRM",
        ],
      },
    ],
    createdAt: new Date().toISOString().split("T")[0],
  };
}
