import {
  AiSearchPlan,
  SinglePromptLeadCampaign,
  UnifiedLeadIntelligenceReport,
  PipelineStage,
} from "@/modules/types";
import { loadIntelligenceReports, saveIntelligenceReports } from "./leadIntelligence.service";

const CAMPAIGNS_STORAGE_KEY = "leadvine_ai_campaigns_v1";

export interface ExecutionSummary {
  totalFound: number;
  verified: number;
  highOpportunity: number;
  hotLeads: number;
  estimatedPipelineValue: number;
}

// Helper to sanitize & extract search intentions from natural language prompt
export function parseUserPromptToPlan(prompt: string, locationOverride?: string): AiSearchPlan {
  const p = prompt.trim();
  const lower = p.toLowerCase();

  // Infer Industry / Category
  let targetIndustry = "Local Businesses";
  if (lower.includes("roof") || lower.includes("roofing")) {
    targetIndustry = "Roofing Contractors";
  } else if (lower.includes("dentist") || lower.includes("dental")) {
    targetIndustry = "Dental Practices";
  } else if (lower.includes("plumb") || lower.includes("plumbing")) {
    targetIndustry = "Plumbing Contractors";
  } else if (lower.includes("bakery") || lower.includes("bakeries") || lower.includes("cafe")) {
    targetIndustry = "Bakeries & Cafes";
  } else if (
    lower.includes("freight") ||
    lower.includes("logistics") ||
    lower.includes("trucking")
  ) {
    targetIndustry = "Freight & Logistics Brokers";
  } else if (lower.includes("restaurant") || lower.includes("dining") || lower.includes("food")) {
    targetIndustry = "Restaurants & Dining";
  } else if (
    lower.includes("law") ||
    lower.includes("lawyer") ||
    lower.includes("attorney") ||
    lower.includes("legal")
  ) {
    targetIndustry = "Law Firms & Legal Services";
  } else if (
    lower.includes("manufactur") ||
    lower.includes("factory") ||
    lower.includes("industrial")
  ) {
    targetIndustry = "Small Manufacturers";
  } else if (lower.includes("hvac") || lower.includes("air condition")) {
    targetIndustry = "HVAC & Climate Contractors";
  } else if (lower.includes("auto") || lower.includes("mechanic") || lower.includes("car repair")) {
    targetIndustry = "Auto Repair & Services";
  } else if (lower.includes("accounting") || lower.includes("cpa") || lower.includes("tax")) {
    targetIndustry = "Accounting & CPA Firms";
  } else if (lower.includes("real estate") || lower.includes("realtor")) {
    targetIndustry = "Real Estate Agencies";
  } else {
    // Clean string for generic input
    const words = p
      .replace(
        /(find|show|get|search|for|in|with|without|that|need|needed|outdated|websites|website|companies|businesses|services)/gi,
        "",
      )
      .trim();
    if (words.length > 0) {
      targetIndustry = words.charAt(0).toUpperCase() + words.slice(1) + " Services";
    }
  }

  // Infer Location dynamically
  let city = "";
  let state = "";
  const country = "United States";
  let textDisplay = "United States";

  if (locationOverride && locationOverride.trim().length > 0) {
    textDisplay = locationOverride.trim();
    const parts = locationOverride.split(",").map((s) => s.trim());
    if (parts.length > 1) {
      city = parts[0];
      state = parts[1];
    } else {
      state = parts[0];
    }
  } else {
    // Dynamic extraction for "in <City>, <State>" or "in <City>"
    const inMatch = p.match(/(?:in|near|around|at)\s+([A-Za-z\s]+?)(?:,\s*([A-Za-z\s]+))?$/i);
    if (inMatch && inMatch[1]) {
      const loc1 = inMatch[1].trim();
      const loc2 = inMatch[2] ? inMatch[2].trim() : "";
      if (loc2) {
        city = loc1;
        state = loc2;
        textDisplay = `${city}, ${state}`;
      } else {
        city = loc1;
        textDisplay = `${city}, USA`;
      }
    } else {
      // Common state & city fallback rules
      const US_STATES: Record<string, string> = {
        florida: "Florida",
        fl: "Florida",
        texas: "Texas",
        tx: "Texas",
        california: "California",
        ca: "California",
        "new york": "New York",
        ny: "New York",
        ohio: "Ohio",
        oh: "Ohio",
        illinois: "Illinois",
        il: "Illinois",
        georgia: "Georgia",
        ga: "Georgia",
        washington: "Washington",
        wa: "Washington",
        colorado: "Colorado",
        co: "Colorado",
        arizona: "Arizona",
        az: "Arizona",
        "north carolina": "North Carolina",
        nc: "North Carolina",
        pennsylvania: "Pennsylvania",
        pa: "Pennsylvania",
        michigan: "Michigan",
        mi: "Michigan",
        tennessee: "Tennessee",
        tn: "Tennessee",
      };

      let foundState = "";
      for (const [key, val] of Object.entries(US_STATES)) {
        if (lower.includes(key)) {
          foundState = val;
          break;
        }
      }

      if (foundState) {
        state = foundState;
        textDisplay = `${state}, USA`;
      } else if (lower.includes("miami")) {
        city = "Miami";
        state = "Florida";
        textDisplay = "Miami, FL";
      } else if (lower.includes("austin")) {
        city = "Austin";
        state = "Texas";
        textDisplay = "Austin, TX";
      } else if (lower.includes("chicago")) {
        city = "Chicago";
        state = "Illinois";
        textDisplay = "Chicago, IL";
      } else if (lower.includes("dallas")) {
        city = "Dallas";
        state = "Texas";
        textDisplay = "Dallas, TX";
      } else if (lower.includes("denver")) {
        city = "Denver";
        state = "Colorado";
        textDisplay = "Denver, CO";
      } else if (lower.includes("seattle")) {
        city = "Seattle";
        state = "Washington";
        textDisplay = "Seattle, WA";
      } else if (lower.includes("atlanta")) {
        city = "Atlanta";
        state = "Georgia";
        textDisplay = "Atlanta, GA";
      } else {
        textDisplay = "National (USA)";
      }
    }
  }

  // Detect Need & Opportunity
  let onlyMissingWebsites = false;
  let primaryOpportunity = "Website Redesign";
  let secondaryOpportunity = "Local SEO & Mobile Lead Conversion";
  let prospectNeed = "Outdated mobile UX, lack of conversion elements, missing local SEO";

  if (
    lower.includes("without website") ||
    lower.includes("no website") ||
    lower.includes("don't have website") ||
    lower.includes("dont have website")
  ) {
    onlyMissingWebsites = true;
    primaryOpportunity = "New Website Development";
    secondaryOpportunity = "Google Business Profile & Online Setup";
    prospectNeed = "No web presence on file, missing online booking and customer contact tools";
  } else if (
    lower.includes("seo") ||
    lower.includes("google presence") ||
    lower.includes("ranking")
  ) {
    primaryOpportunity = "Local SEO & Google Business Profile";
    secondaryOpportunity = "Website Conversion Optimization";
    prospectNeed =
      "Weak organic keyword presence, missing local map pack rank, unoptimized GMB listing";
  } else if (
    lower.includes("online ordering") ||
    lower.includes("booking") ||
    lower.includes("ecommerce")
  ) {
    primaryOpportunity = "Online Ordering & Booking System";
    secondaryOpportunity = "Mobile Responsive Redesign";
    prospectNeed =
      "Lacks automated digital booking/ordering system, losing online customers to competitors";
  } else if (
    lower.includes("lead generation") ||
    lower.includes("growth") ||
    lower.includes("marketing")
  ) {
    primaryOpportunity = "Lead Generation System & Website Redesign";
    secondaryOpportunity = "Automated CRM & Multi-Channel Outreach";
    prospectNeed =
      "Low online lead conversion, unoptimized call-to-actions, missing instant response system";
  }

  const targetCharacteristics = [
    "Established local business",
    "Active customer phone & Google reviews",
    "1–50 employees",
    "High growth potential",
  ];

  if (onlyMissingWebsites) {
    targetCharacteristics.push("Zero current website footprint");
  } else {
    targetCharacteristics.push("Mobile UX score below 60/100");
  }

  return {
    id: `plan-${Date.now()}`,
    userPrompt: p,
    targetIndustry,
    location: {
      city,
      state,
      country,
      radiusMiles: 50,
      textDisplay,
    },
    idealCustomerProfile: `Local ${targetIndustry.toLowerCase()} with 1–50 employees & active operational status`,
    targetCharacteristics,
    prospectNeed,
    primaryOpportunity,
    secondaryOpportunity,
    estimatedResults: Math.floor(Math.random() * 400) + 850,
    estimatedValuePerLead: { min: 2500, max: 6000 },
    minLeadScore: 60,
    websiteScoreFilter: onlyMissingWebsites ? 0 : 70,
    onlyMissingWebsites,
    configuredSources: [
      "Google Places / Google Maps API",
      "Yelp Directory Registry",
      "Bing Places Database",
      "State Business Registries",
      "Domain & WHOIS Intelligence",
      "Chamber of Commerce Index",
    ],
    scoringWeights: {
      websiteQuality: 35,
      businessReputation: 25,
      contactAvailability: 20,
      marketFit: 20,
    },
    created_at: new Date().toISOString(),
  };
}

// Natural language refinement handler
export function refinePlanWithNaturalLanguage(
  currentPlan: AiSearchPlan,
  refinementInstruction: string,
): AiSearchPlan {
  const text = refinementInstruction.toLowerCase().trim();
  const updated = { ...currentPlan, id: `plan-${Date.now()}` };

  if (
    text.includes("50 reviews") ||
    text.includes("more reviews") ||
    text.includes("high rating")
  ) {
    if (!updated.targetCharacteristics.includes("Over 50 Google customer reviews")) {
      updated.targetCharacteristics = [
        ...updated.targetCharacteristics,
        "Over 50 Google customer reviews",
      ];
    }
  }

  if (text.includes("no website") || text.includes("without website")) {
    updated.onlyMissingWebsites = true;
    updated.websiteScoreFilter = 0;
    updated.primaryOpportunity = "New Website Development";
    updated.secondaryOpportunity = "Google Business Setup";
    if (!updated.targetCharacteristics.includes("Zero current website")) {
      updated.targetCharacteristics.push("Zero current website");
    }
  }

  if (text.includes("verified phone") || text.includes("verified number")) {
    if (!updated.targetCharacteristics.includes("100% verified direct phone line")) {
      updated.targetCharacteristics.push("100% verified direct phone line");
    }
  }

  if (text.includes("score above") || text.includes("score over") || text.includes("score >")) {
    const match = text.match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      if (val >= 40 && val <= 95) {
        updated.minLeadScore = val;
      }
    } else {
      updated.minLeadScore = 80;
    }
  }

  if (text.includes("miami")) {
    updated.location = {
      ...updated.location,
      city: "Miami",
      state: "Florida",
      textDisplay: "Miami, FL (50 mi radius)",
    };
  } else if (text.includes("texas")) {
    updated.location = { ...updated.location, state: "Texas", textDisplay: "Texas, USA" };
  } else if (text.includes("california")) {
    updated.location = { ...updated.location, state: "California", textDisplay: "California, USA" };
  }

  return updated;
}

// Execute complete multi-stage AI Lead Discovery & Analysis Pipeline
export function executeAiSearch(plan: AiSearchPlan): {
  campaign: SinglePromptLeadCampaign;
  newLeads: UnifiedLeadIntelligenceReport[];
  summary: ExecutionSummary;
} {
  const locStr = plan.location.textDisplay || "National";
  const ind = plan.targetIndustry;

  // Generate realistic discovered leads count
  const totalFound = Math.min(plan.estimatedResults, 1247);
  const verified = Math.round(totalFound * 0.31);
  const highOpportunity = Math.round(verified * 0.368);
  const hotLeads = Math.round(highOpportunity * 0.33);
  const avgValue = Math.round(
    (plan.estimatedValuePerLead.min + plan.estimatedValuePerLead.max) / 2,
  );
  const estimatedPipelineValue = highOpportunity * avgValue;

  // Generate 8 rich, customized leads for this exact prompt
  const leadTemplates = getIndustryLeadTemplates(ind, locStr, plan.onlyMissingWebsites);
  const newLeads: UnifiedLeadIntelligenceReport[] = leadTemplates.map((tmpl, idx) => {
    const id = `ai-lead-${Date.now()}-${idx + 1}`;
    const isHot = idx < 2;
    const isHigh = idx >= 2 && idx < 5;
    const leadScore = isHot
      ? Math.floor(Math.random() * 8) + 91
      : isHigh
        ? Math.floor(Math.random() * 12) + 76
        : Math.floor(Math.random() * 14) + 61;

    const pipelineStage: PipelineStage = isHot ? "prioritize" : isHigh ? "score" : "enrich";

    const report: UnifiedLeadIntelligenceReport = {
      id,
      businessName: tmpl.name,
      websiteUrl: tmpl.website,
      category: ind,
      city: tmpl.city,
      address: tmpl.address,
      googleRating: tmpl.rating,
      reviewCount: tmpl.reviewCount,
      leadSources: plan.configuredSources.slice(0, 3),
      pipelineStage,
      verification: {
        businessExists: true,
        websiteReachable: !plan.onlyMissingWebsites,
        phoneValid: true,
        emailValid: true,
        isDuplicate: false,
        currentlyOperating: true,
      },
      decisionMaker: tmpl.decisionMaker,
      auditScores: tmpl.auditScores,
      missingFeatures: tmpl.missingFeatures,
      redesignOpportunities: tmpl.redesignOpportunities,
      techStack: tmpl.techStack,
      seoSummary: tmpl.seoSummary,
      competitors: tmpl.competitors,
      problemsIdentified: tmpl.problemsIdentified,
      aiOpportunity: {
        leadScore,
        priorityLevel: leadScore >= 90 ? "CRITICAL" : leadScore >= 75 ? "HIGH" : "MEDIUM",
        whyContactReasoning: `${tmpl.name} has a strong local reputation (${tmpl.rating}⭐ with ${tmpl.reviewCount} reviews in ${tmpl.city}) but loses up to 65% of web visitors due to ${tmpl.primaryDefect}.`,
        whatToSellRecommendation: `${plan.primaryOpportunity} + ${plan.secondaryOpportunity}`,
        recommendedService: plan.primaryOpportunity,
        estimatedContractValueMin: plan.estimatedValuePerLead.min,
        estimatedContractValueMax: plan.estimatedValuePerLead.max,
        bestDecisionMakerTitle: tmpl.decisionMaker.title,
        pitchAngle: `Help ${tmpl.name} convert 20-30 additional monthly inquiries by fixing their ${tmpl.primaryDefect}.`,
      },
      outreach: {
        emailSubject: `Quick digital audit & mockup for ${tmpl.name}`,
        emailBody: `Hi ${tmpl.decisionMaker.name.split(" ")[0]},\n\nI was looking at top-rated ${ind.toLowerCase()} businesses in ${tmpl.city} and noticed ${tmpl.name}.\n\nWhen reviewing your online presence on mobile, I identified that visitors cannot easily request a quote or book online directly from their phones.\n\nWe prepared a complimentary visual preview showing how a modern mobile layout + automated booking form could capture 15-25 additional qualified clients every month.\n\nWould you be open to a 2-minute video preview?\n\nBest regards,\nLeadVine AI Intelligence`,
        smsText: `Hi ${tmpl.decisionMaker.name.split(" ")[0]}! Noticed ${tmpl.name} has an impressive ${tmpl.rating}⭐ rating in ${tmpl.city}. Built a 30-second mobile site mockup showing how adding 1-click booking could boost inquiries. Mind if I text you the link?`,
        linkedInMessage: `Hi ${tmpl.decisionMaker.name.split(" ")[0]}, reached out regarding ${tmpl.name}'s digital strategy. We built a 1-page mobile conversion teardown for your practice/business!`,
        coldCallScript: {
          opening: `Hi ${tmpl.decisionMaker.name.split(" ")[0]}, this is [Your Name] with LeadVine. I saw ${tmpl.name}'s stellar reviews in ${tmpl.city}.`,
          hook: `I noticed your site isn't fully optimized for mobile phone users looking for immediate quotes.`,
          pitch: `We design high-converting mobile websites for ${ind.toLowerCase()} that typically boost online quote requests by 35%.`,
          objectionHandlers: [
            {
              objection: "We already have a web designer.",
              response:
                "Completely understand! We actually specialize purely in adding instant mobile lead forms that plug into existing systems. Can I send a 30-second demo?",
            },
          ],
        },
        followUpSteps: [
          {
            day: 3,
            channel: "email",
            subjectOrNote: `Re: Quick digital audit & mockup for ${tmpl.name}`,
            message: `Hi ${tmpl.decisionMaker.name.split(" ")[0]}, following up on my previous note. Open to seeing the quick 30-second visual audit?`,
          },
          {
            day: 7,
            channel: "phone",
            subjectOrNote: "Follow-up phone check-in",
            message: `Call ${tmpl.decisionMaker.name} at ${tmpl.decisionMaker.phone} to check if they received the video audit.`,
          },
        ],
      },
      crmSynced: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return report;
  });

  // Save leads to local database so they are accessible throughout LeadVine
  const existingReports = loadIntelligenceReports();
  // Filter out any duplicates
  const existingIds = new Set(existingReports.map((r) => r.id));
  const filteredNew = newLeads.filter((r) => !existingIds.has(r.id));
  const updatedReports = [...filteredNew, ...existingReports];
  saveIntelligenceReports(updatedReports);

  const campaign: SinglePromptLeadCampaign = {
    id: `campaign-${Date.now()}`,
    title: `${plan.targetIndustry} - ${locStr} Lead Search`,
    searchPlan: plan,
    leadsDiscoveredCount: totalFound,
    verifiedCount: verified,
    highOpportunityCount: highOpportunity,
    hotLeadsCount: hotLeads,
    totalPipelineValue: estimatedPipelineValue,
    leads: newLeads,
    created_at: new Date().toISOString(),
  };

  // Save campaign to local storage
  saveAiCampaign(campaign);

  return {
    campaign,
    newLeads,
    summary: {
      totalFound,
      verified,
      highOpportunity,
      hotLeads,
      estimatedPipelineValue,
    },
  };
}

// Campaign storage helpers
export function getAiCampaigns(): SinglePromptLeadCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAiCampaign(campaign: SinglePromptLeadCampaign): void {
  if (typeof window === "undefined") return;
  try {
    const campaigns = getAiCampaigns();
    const filtered = campaigns.filter((c) => c.id !== campaign.id);
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify([campaign, ...filtered]));
  } catch (err) {
    console.error("Failed to save AI Campaign:", err);
  }
}

export function deleteAiCampaign(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const campaigns = getAiCampaigns();
    const updated = campaigns.filter((c) => c.id !== id);
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete AI Campaign:", err);
  }
}

// Helper template generator for realistic lead creation
function getIndustryLeadTemplates(industry: string, locationDisplay: string, noWebsite: boolean) {
  const locParts = locationDisplay.split(",");
  const city = locParts[0].trim().replace(/\(.*?\)/g, "") || "Tampa";
  const state = locParts[1]?.trim() || "FL";

  const indClean = industry
    .replace(/(Contractors|Practices|Services|Firms|Brokers|Agencies)/gi, "")
    .trim();

  return [
    {
      name: `Apex ${indClean} & Solutions`,
      website: noWebsite ? "" : `https://apex${indClean.toLowerCase().replace(/\s+/g, "")}demo.com`,
      city: `${city}, ${state}`,
      address: `1024 Commercial Blvd, ${city}, ${state}`,
      rating: 4.8,
      reviewCount: 142,
      primaryDefect: "unoptimized mobile layout and missing online estimate calculator",
      decisionMaker: {
        name: "Marcus Vance",
        title: "Managing Owner",
        email: `m.vance@apex${indClean.toLowerCase().replace(/\s+/g, "")}demo.com`,
        emailVerified: true,
        phone: "+1 (813) 555-0192",
        phoneVerified: true,
        linkedinUrl: "https://linkedin.com/in/marcus-vance-demo",
      },
      auditScores: {
        mobileUx: 38,
        design: 42,
        performance: 31,
        seo: 55,
        accessibility: 40,
        trust: 78,
        conversion: 28,
        security: 60,
      },
      missingFeatures: [
        "Mobile Instant Quote",
        "Online Appointment Scheduling",
        "SSL Badge",
        "Customer Video Reviews",
      ],
      redesignOpportunities: [
        "Redesign mobile header CTA",
        "Add 1-click phone call button",
        "Deploy automated booking widget",
      ],
      techStack: {
        cms: "WordPress 4.9 (Legacy)",
        frameworks: ["jQuery 1.12"],
        analytics: [],
        marketingPixels: [],
        infrastructure: ["Apache Shared"],
        outdatedFlags: ["Deprecated PHP version", "Uncompressed assets"],
        score: 35,
      },
      seoSummary: {
        domainAgeYears: 7,
        organicKeywordsEst: 42,
        monthlyTrafficEst: 180,
        backlinksEst: 29,
        rankingOpportunities: [
          `best ${indClean.toLowerCase()} in ${city}`,
          `${indClean.toLowerCase()} quote ${city}`,
        ],
      },
      competitors: [
        {
          competitorName: `Premier ${indClean} Group`,
          website: `https://premier${indClean.toLowerCase().replace(/\s+/g, "")}.com`,
          googleRating: 4.9,
          reviewCount: 310,
          designGrade: "A",
          pageSpeedScore: 92,
          seoScore: 88,
          techStack: ["Next.js", "Tailwind", "GA4"],
        },
      ],
      problemsIdentified: [
        {
          title: "Critical Mobile UX Issues",
          severity: "critical" as const,
          description: "Text and touch targets cut off on iPhone and Android browsers.",
        },
        {
          title: "Low Lead Conversion",
          severity: "critical" as const,
          description: "No clear request form above the fold.",
        },
        {
          title: "Slow Page Loading",
          severity: "warning" as const,
          description: "Homepage takes 4.2 seconds to load over 4G.",
        },
      ],
    },
    {
      name: `Suncoast ${indClean} Group`,
      website: noWebsite
        ? ""
        : `https://suncoast${indClean.toLowerCase().replace(/\s+/g, "")}fl.com`,
      city: `Miami, FL`,
      address: `450 Biscayne Blvd, Miami, FL 33132`,
      rating: 4.9,
      reviewCount: 218,
      primaryDefect: "slow mobile page speed and absence of local search schema",
      decisionMaker: {
        name: "Elena Rostova",
        title: "Co-Founder & General Manager",
        email: `elena@suncoast${indClean.toLowerCase().replace(/\s+/g, "")}fl.com`,
        emailVerified: true,
        phone: "+1 (305) 555-8319",
        phoneVerified: true,
        linkedinUrl: "https://linkedin.com/in/elena-rostova-demo",
      },
      auditScores: {
        mobileUx: 45,
        design: 48,
        performance: 36,
        seo: 42,
        accessibility: 50,
        trust: 85,
        conversion: 35,
        security: 70,
      },
      missingFeatures: ["Local SEO Schema Markup", "Live Chat Widget", "SMS Auto-responder"],
      redesignOpportunities: [
        "Migrate to high-speed Next.js framework",
        "Integrate local map pack schema",
      ],
      techStack: {
        cms: "Wix (Standard)",
        frameworks: ["React 16"],
        analytics: ["Google Analytics Universal"],
        marketingPixels: [],
        infrastructure: ["Cloudflare"],
        outdatedFlags: ["Universal Analytics EOL"],
        score: 45,
      },
      seoSummary: {
        domainAgeYears: 5,
        organicKeywordsEst: 65,
        monthlyTrafficEst: 310,
        backlinksEst: 45,
        rankingOpportunities: [
          `top rated ${indClean.toLowerCase()} miami`,
          `affordable ${indClean.toLowerCase()}`,
        ],
      },
      competitors: [],
      problemsIdentified: [
        {
          title: "Missing Local SEO Schema",
          severity: "critical" as const,
          description: "Business is missing JSON-LD local business metadata.",
        },
        {
          title: "Outdated Analytics Integration",
          severity: "warning" as const,
          description: "Using legacy Universal Analytics code.",
        },
      ],
    },
    {
      name: `Gulf Coast ${indClean} Specialists`,
      website: noWebsite
        ? ""
        : `https://gulfcoast${indClean.toLowerCase().replace(/\s+/g, "")}.net`,
      city: `Orlando, ${state}`,
      address: `880 Orange Ave, Orlando, ${state} 32801`,
      rating: 4.7,
      reviewCount: 94,
      primaryDefect: "lack of online booking system and weak call-to-actions",
      decisionMaker: {
        name: "Robert Sterling",
        title: "Owner / Director",
        email: `robert@gulfcoast${indClean.toLowerCase().replace(/\s+/g, "")}.net`,
        emailVerified: true,
        phone: "+1 (407) 555-4921",
        phoneVerified: true,
      },
      auditScores: {
        mobileUx: 52,
        design: 50,
        performance: 44,
        seo: 58,
        accessibility: 55,
        trust: 80,
        conversion: 40,
        security: 65,
      },
      missingFeatures: ["Automated CRM Sync", "Customer Portal", "Review Aggregator"],
      redesignOpportunities: [
        "Implement modern booking form",
        "Add trust seals and warranty badges",
      ],
      techStack: {
        cms: "Squarespace 7.0",
        frameworks: [],
        analytics: [],
        marketingPixels: [],
        infrastructure: ["Squarespace Cloud"],
        outdatedFlags: [],
        score: 55,
      },
      seoSummary: {
        domainAgeYears: 4,
        organicKeywordsEst: 38,
        monthlyTrafficEst: 140,
        backlinksEst: 18,
        rankingOpportunities: [`${indClean.toLowerCase()} in orlando`],
      },
      competitors: [],
      problemsIdentified: [
        {
          title: "Unoptimized Contact Form",
          severity: "warning" as const,
          description: "Generic form with no automated instant notification.",
        },
      ],
    },
    {
      name: `Precision ${indClean} Services`,
      website: noWebsite
        ? ""
        : `https://precision${indClean.toLowerCase().replace(/\s+/g, "")}.com`,
      city: `Jacksonville, ${state}`,
      address: `1200 Atlantic Blvd, Jacksonville, ${state} 32207`,
      rating: 4.6,
      reviewCount: 78,
      primaryDefect: "outdated visual branding and slow mobile load speeds",
      decisionMaker: {
        name: "David Chen",
        title: "Operations Director",
        email: `dchen@precision${indClean.toLowerCase().replace(/\s+/g, "")}.com`,
        emailVerified: true,
        phone: "+1 (904) 555-2041",
        phoneVerified: true,
      },
      auditScores: {
        mobileUx: 40,
        design: 35,
        performance: 30,
        seo: 48,
        accessibility: 42,
        trust: 72,
        conversion: 30,
        security: 50,
      },
      missingFeatures: ["Mobile Speed Optimization", "Video Hero Header", "Live Chat"],
      redesignOpportunities: ["Rebrand visual identity", "Optimize compressed WebP assets"],
      techStack: {
        cms: "Custom PHP",
        frameworks: ["Bootstrap 3"],
        analytics: [],
        marketingPixels: [],
        infrastructure: ["GoDaddy Hosting"],
        outdatedFlags: ["Bootstrap 3 EOL"],
        score: 30,
      },
      seoSummary: {
        domainAgeYears: 8,
        organicKeywordsEst: 50,
        monthlyTrafficEst: 200,
        backlinksEst: 32,
        rankingOpportunities: [`jacksonville ${indClean.toLowerCase()}`],
      },
      competitors: [],
      problemsIdentified: [
        {
          title: "Outdated Bootstrap Framework",
          severity: "critical" as const,
          description: "Using deprecated Bootstrap 3 layout grid.",
        },
      ],
    },
    {
      name: `Horizon ${indClean} Pro`,
      website: noWebsite ? "" : `https://horizon${indClean.toLowerCase().replace(/\s+/g, "")}.com`,
      city: `Fort Lauderdale, FL`,
      address: `330 Broward Blvd, Fort Lauderdale, FL 33301`,
      rating: 4.8,
      reviewCount: 165,
      primaryDefect: "absence of automated quote calculator and poor trust signal placement",
      decisionMaker: {
        name: "Sarah Jenkins",
        title: "Managing Partner",
        email: `sarah@horizon${indClean.toLowerCase().replace(/\s+/g, "")}.com`,
        emailVerified: true,
        phone: "+1 (954) 555-9012",
        phoneVerified: true,
      },
      auditScores: {
        mobileUx: 58,
        design: 54,
        performance: 48,
        seo: 62,
        accessibility: 58,
        trust: 82,
        conversion: 45,
        security: 75,
      },
      missingFeatures: ["Interactive Price Estimator", "Automated SMS Confirmations"],
      redesignOpportunities: ["Deploy instant price calculator", "Hero section redesign"],
      techStack: {
        cms: "WordPress 5.8",
        frameworks: ["Elementor"],
        analytics: ["GA4"],
        marketingPixels: [],
        infrastructure: ["SiteGround"],
        outdatedFlags: [],
        score: 60,
      },
      seoSummary: {
        domainAgeYears: 6,
        organicKeywordsEst: 85,
        monthlyTrafficEst: 420,
        backlinksEst: 54,
        rankingOpportunities: [`fort lauderdale ${indClean.toLowerCase()}`],
      },
      competitors: [],
      problemsIdentified: [
        {
          title: "Bloated Elementor Page Builder",
          severity: "warning" as const,
          description: "Excessive DOM size slowing mobile load time.",
        },
      ],
    },
  ];
}
