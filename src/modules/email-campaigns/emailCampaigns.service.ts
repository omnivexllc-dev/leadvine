import { EmailCampaign } from "../types";

export function getCampaignsData(): EmailCampaign[] {
  return [
    {
      id: "camp-1",
      name: "Q3 Web Redesign Blitz — Legal & Dental",
      status: "active",
      totalProspects: 142,
      sentCount: 120,
      openRatePct: 64.2,
      clickRatePct: 32.8,
      replyRatePct: 18.5,
      meetingsBooked: 14,
      steps: [
        {
          id: "s1",
          stepNumber: 1,
          type: "email",
          title: "Initial Audit & Redesign Teaser",
          subject: "Quick question regarding your website",
        },
        { id: "s2", stepNumber: 2, type: "delay", title: "Delay 3 Days", delayDays: 3 },
        {
          id: "s3",
          stepNumber: 3,
          type: "followup",
          title: "Competitor Benchmark Comparison",
          subject: "How local competitors compare",
        },
        { id: "s4", stepNumber: 4, type: "delay", title: "Delay 4 Days", delayDays: 4 },
        {
          id: "s5",
          stepNumber: 5,
          type: "reminder",
          title: "Final Wireframe Concept Teaser",
          subject: "1-page design concept for your team",
        },
      ],
    },
  ];
}
