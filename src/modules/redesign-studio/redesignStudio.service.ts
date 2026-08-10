import { RedesignProposal } from "../types";

export interface ExtendedRedesignProposal extends RedesignProposal {
  beforeWebsiteState: {
    mobileScore: number;
    desktopScore: number;
    coreIssues: string[];
    outdatedDesignFlags: string[];
  };
  afterWebsiteState: {
    expectedConversionBoost: string;
    expectedLoadTimeSeconds: string;
    keyHighlights: string[];
  };
  costEstimates: {
    tier: string;
    price: number;
    timelineWeeks: number;
    deliverables: string[];
    recommended?: boolean;
  }[];
  generatedOutreachEmail: {
    subject: string;
    body: string;
  };
  generatedProposalText: string;
}

export function generateRedesignProposal(
  businessName: string,
  websiteUrl: string,
): ExtendedRedesignProposal {
  const formattedName = businessName.trim() || "Target Client";
  const formattedUrl = websiteUrl.trim() || "example.com";

  return {
    id: `proposal-${Date.now()}`,
    leadName: formattedName,
    websiteUrl: formattedUrl,
    heroHeadline: `Transforming ${formattedName} Into the #1 Trusted Local Choice`,
    heroSubtitle: `Modern, ultra-fast, mobile-first web experience engineered to turn visitor traffic into 3x more appointments and revenue.`,
    primaryCtaText: `Get Instant Quote & Book Online`,
    suggestedColorPalette: [
      { name: "Deep Emerald", hex: "#064E3B", role: "Primary Brand Accent" },
      { name: "Warm Cream", hex: "#FDFBF7", role: "Background Canvas" },
      { name: "Accent Amber", hex: "#D97706", role: "CTA Highlights" },
      { name: "Dark Slate", hex: "#1E293B", role: "Typography & Headings" },
    ],
    suggestedTypography: {
      displayFont: "Fraunces / Playfair Display",
      bodyFont: "Plus Jakarta Sans / Inter",
      reasoning:
        "Pairs high-trust editorial authority for headings with crystal-clear legibility on mobile viewports.",
    },
    conversionFixes: [
      "Sticky mobile bottom bar with instant tap-to-call button.",
      "Interactive 60-second instant quote & booking wizard.",
      "Embedded Google 5-Star Reviews live trust carousel.",
      "Clear 3-step service process section eliminating buyer doubt.",
    ],
    suggestedPages: [
      "Homepage Redesign",
      "Core Services & Pricing",
      "Interactive Estimator",
      "Case Studies & Before/After",
      "About Us & Team",
      "Online Booking / Contact",
    ],
    layoutStructure: [
      {
        section: "1. High-Impact Hero",
        description: "Bold benefit headline + 2-field quote form + Google 5-Star badge.",
      },
      {
        section: "2. Client Social Proof Marquee",
        description: "Google rating badge + verified customer review carousel.",
      },
      {
        section: "3. Core Services Grid",
        description: "Clean cards with custom micro-interactions and instant action buttons.",
      },
      {
        section: "4. Interactive Price Calculator",
        description: "Self-service quote tool driving immediate lead capture.",
      },
      {
        section: "5. Real Project Showcase",
        description: "High-resolution project gallery and customer video testimonials.",
      },
      {
        section: "6. Sticky Call-To-Action Footer",
        description: "Prominent tap-to-call button, location map, and direct scheduling.",
      },
    ],
    beforeWebsiteState: {
      mobileScore: 38,
      desktopScore: 52,
      coreIssues: [
        "Non-responsive mobile viewport layout causes horizontal scrolling.",
        "Slow load times (4.8s on mobile 4G network).",
        "Missing clear Call-To-Action above the fold.",
        "Outdated 2014 typography and low-contrast text elements.",
        "Unsecured HTTP forms triggering browser security warnings.",
      ],
      outdatedDesignFlags: [
        "Cluttered sidebar navigation",
        "Small tap targets (<30px)",
        "Flash/Legacy script dependencies",
        "No live online booking option",
      ],
    },
    afterWebsiteState: {
      expectedConversionBoost: "+240% Inbound Inquiries",
      expectedLoadTimeSeconds: "0.8s (Sub-second Core Web Vitals)",
      keyHighlights: [
        "100/100 Google Lighthouse Speed Score",
        "Mobile-first responsive fluid architecture",
        "1-Click online scheduling & CRM lead routing",
        "Built-in local SEO schema & review syndication",
      ],
    },
    costEstimates: [
      {
        tier: "Essential Redesign",
        price: 2800,
        timelineWeeks: 2,
        deliverables: [
          "5-Page Modern Website Redesign",
          "Mobile & Tablet Responsive Optimization",
          "Basic On-Page SEO & Meta Setup",
          "Contact Form & Google Map Integration",
        ],
      },
      {
        tier: "Growth & Lead Machine",
        price: 4500,
        timelineWeeks: 3,
        deliverables: [
          "8-Page Full Custom Website Redesign",
          "Interactive 60-second Quote Calculator",
          "Google 5-Star Reviews Live Widget",
          "CRM Auto-lead Notification Sync",
          "PageSpeed Sub-second Speed Guarantee",
        ],
        recommended: true,
      },
      {
        tier: "Enterprise Authority Package",
        price: 7200,
        timelineWeeks: 4,
        deliverables: [
          "Complete Multi-page Website + Landing Pages",
          "Custom Interactive Booking System",
          "Local SEO Schema & Directory Syndication",
          "A/B Split Testing & Conversion Rate Engine",
          "3 Months Post-Launch Management & Hosting",
        ],
      },
    ],
    generatedOutreachEmail: {
      subject: `Quick concept: Modernizing ${formattedName}'s website (+240% conversion lead boost)`,
      body: `Hi team at ${formattedName},

I was looking over local industry websites in your area and noticed ${formattedName}'s current site (${formattedUrl}) is missing a few key modern conversion elements that are costing you mobile inquiries.

Our team put together a complimentary 3D Before vs. After Website Redesign Wireframe for ${formattedName}.

Key Improvements in the Concept:
• Sub-second mobile loading speed (down from 4.8s)
• Sticky 1-tap call & online quote scheduling widget
• Google 5-Star verified review carousel right in the hero section

We estimated a full overhaul would take about 2-3 weeks and boost your inbound web bookings significantly.

Would you be open to taking a 3-minute look at the interactive redesign preview?

Best regards,
LeadVine Agency Team`,
    },
    generatedProposalText: `EXECUTIVE PROPOSAL FOR ${formattedName.toUpperCase()}
Website: ${formattedUrl}

OBJECTIVE:
Transform ${formattedName}'s existing web presence into a high-converting, sub-second mobile lead engine.

SUMMARY OF AUDIT FINDINGS:
- Current Site Mobile Performance Score: 38/100
- Core Friction Points: Missing tap-to-call CTA, slow mobile load time (4.8s), non-responsive layouts on newer mobile screens.

PROPOSED SOLUTION & DELIVERABLES:
1. High-Impact Hero Section with Benefit-Driven Copy and Instant Quote Estimator
2. Verified Google Reviews Social Proof Marquee
3. Mobile-First Fluid Grid with 100/100 Lighthouse Performance
4. Direct CRM Lead Integration

RECOMMENDED PACKAGE:
Growth & Lead Machine ($4,500 | 3-Week Delivery)

EXPECTED IMPACT:
+240% Increase in online lead conversions within 60 days of launch.`,
  };
}
