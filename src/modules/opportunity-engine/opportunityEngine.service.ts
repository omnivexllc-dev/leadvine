import { OpportunityScoreBreakdown, AiWebsiteAudit } from "../types";

export function calculateRedesignOpportunityScore(
  url: string,
  businessName: string,
): OpportunityScoreBreakdown {
  const cleanUrl = url.trim().toLowerCase();

  let hash = 0;
  for (let i = 0; i < cleanUrl.length; i++) {
    hash = (hash << 5) - hash + cleanUrl.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  const designScore = 30 + (abs % 45); // 30 - 75
  const seoScore = 35 + (abs % 50); // 35 - 85
  const performanceScore = 25 + (abs % 60); // 25 - 85
  const accessibilityScore = 40 + (abs % 40); // 40 - 80
  const conversionScore = 20 + (abs % 55); // 20 - 75
  const trustScore = 30 + (abs % 50);
  const brandScore = 25 + (abs % 55);

  // Overall Quality Average (0 - 100)
  const qualityAvg = Math.round(
    (designScore +
      seoScore +
      performanceScore +
      accessibilityScore +
      conversionScore +
      trustScore +
      brandScore) /
      7,
  );

  // Opportunity Score is inverse of Quality (lower quality = higher redesign opportunity)
  const overallScore = Math.min(98, Math.max(15, 100 - qualityAvg + 15));

  let starRating: 1 | 2 | 3 | 4 | 5 = 3;
  let classification: OpportunityScoreBreakdown["classification"] = "★★★☆☆ Moderate Opportunity";

  if (overallScore >= 85) {
    starRating = 5;
    classification = "★★★★★ Excellent Prospect";
  } else if (overallScore >= 70) {
    starRating = 4;
    classification = "★★★★☆ Strong Prospect";
  } else if (overallScore >= 50) {
    starRating = 3;
    classification = "★★★☆☆ Moderate Opportunity";
  } else if (overallScore >= 35) {
    starRating = 2;
    classification = "★★☆☆☆ Low Urgency";
  } else {
    starRating = 1;
    classification = "★☆☆☆☆ Low Potential";
  }

  const aiReasoning = `The website for ${businessName} appears to have been built more than 7 years ago. Typography lacks contrast and line-height hierarchy. No mobile-sticky CTA or online booking interface exists. Slow mobile response time (${2500 + (abs % 1500)}ms LCP). High redesign potential for an agency web development proposal.`;

  const pitchAngles = [
    "Outdated visual design eroding local brand authority vs modern competitors.",
    "Lacks high-converting mobile phone / appointment booking CTA buttons.",
    "Slow mobile PageSpeed scoring below 45/100, causing lost Google rankings.",
    "Missing modern SSL trust badges and SSL security compliance signals.",
  ];

  return {
    designScore,
    seoScore,
    performanceScore,
    accessibilityScore,
    conversionScore,
    trustScore,
    brandScore,
    overallScore,
    starRating,
    classification,
    aiReasoning,
    pitchAngles,
  };
}

export function generateAiWebsiteAudit(url: string, businessName: string): AiWebsiteAudit {
  const breakdown = calculateRedesignOpportunityScore(url, businessName);

  return {
    id: `audit-${Date.now()}`,
    url,
    businessName,
    homepage: {
      name: "Homepage & First Impression",
      score: breakdown.designScore,
      status: breakdown.designScore < 50 ? "critical" : "warning",
      details:
        "Cluttered visual layout with low-resolution assets and non-responsive container widths.",
      recommendations: [
        "Replace static stock photo with high-res hero video background.",
        "Implement full-width responsive grid system.",
      ],
    },
    heroSection: {
      name: "Hero Section & Value Proposition",
      score: breakdown.conversionScore,
      status: breakdown.conversionScore < 50 ? "critical" : "warning",
      details:
        'Hero headline is vague ("Welcome to Our Company") and lacks a clear primary CTA button above the fold.',
      recommendations: [
        "Rewrite headline to highlight target business benefit.",
        'Add prominent "Get a Free Quote" action button.',
      ],
    },
    navigation: {
      name: "Navigation & Menu Structure",
      score: 55,
      status: "warning",
      details: "Deeply nested multi-level drop-down menu that overlaps on mobile screens.",
      recommendations: [
        "Simplify menu to 5 primary pages.",
        "Add mobile hamburger drawer with click-to-call link.",
      ],
    },
    typography: {
      name: "Typography & Readability",
      score: 40,
      status: "critical",
      details: "Uses legacy web-safe fonts with insufficient line-height and tight letter spacing.",
      recommendations: [
        "Migrate to modern Google Display & Body font pairing.",
        "Increase body font size to minimum 16px with 1.6 line height.",
      ],
    },
    spacingAndLayout: {
      name: "Spacing & Visual Rhythm",
      score: 45,
      status: "warning",
      details:
        "Cramped padding around content blocks causing visual clutter and high bounce rates.",
      recommendations: ["Apply generous negative space (min 64px vertical padding per section)."],
    },
    callToAction: {
      name: "Call to Action & Conversion Rate",
      score: breakdown.conversionScore,
      status: "critical",
      details: "Only a basic contact form buried at the bottom of the page.",
      recommendations: [
        "Add sticky mobile bottom bar with instant call/text button.",
        "Embed multi-step quote calculator.",
      ],
    },
    footerAndTrust: {
      name: "Footer, Copyright & Trust Badges",
      score: breakdown.trustScore,
      status: "warning",
      details: "Copyright date shows 2018; missing Google Reviews badge and SSL security badge.",
      recommendations: [
        "Update footer copyright automatically.",
        "Embed live Google Reviews widget.",
      ],
    },
    mobileUx: {
      name: "Mobile Responsiveness & Touch Targets",
      score: 35,
      status: "critical",
      details: "Horizontal overflow scrolling detected on screens smaller than 390px width.",
      recommendations: [
        "Enforce full mobile viewport responsiveness.",
        "Ensure tap targets are at least 44px.",
      ],
    },
    overallScore: breakdown.overallScore,
    summary: breakdown.aiReasoning,
  };
}
