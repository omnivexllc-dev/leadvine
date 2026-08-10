import { PipelineStage, PipelineStageInfo, UnifiedLeadIntelligenceReport } from "@/modules/types";

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: "discover",
    label: "1. Discover",
    description: "Multi-source lead capture (Google Places, Directories, Industry registers)",
    order: 1,
  },
  {
    id: "verify",
    label: "2. Verify",
    description: "Automated check for phone validity, website reachability, and operating status",
    order: 2,
  },
  {
    id: "enrich",
    label: "3. Enrich",
    description: "Decision-maker discovery, verified direct email, phone & social profiles",
    order: 3,
  },
  {
    id: "analyze",
    label: "4. Analyze",
    description: "8-dimension AI site audit, mobile UX, performance, trust & tech detection",
    order: 4,
  },
  {
    id: "score",
    label: "5. Score",
    description: "AI Lead Intelligence Score (0-100) & opportunity value calculator",
    order: 5,
  },
  {
    id: "prioritize",
    label: "6. Prioritize",
    description: "Automated ranking into Critical, High, and Moderate sales targets",
    order: 6,
  },
  {
    id: "contact",
    label: "7. Contact",
    description: "Multi-channel outreach (Cold Email, SMS, LinkedIn, Cold Call script)",
    order: 7,
  },
  {
    id: "track",
    label: "8. Track",
    description: "Engagement tracking, email opens, replies, and follow-up sequences",
    order: 8,
  },
  {
    id: "convert",
    label: "9. Convert",
    description: "Proposal generation, pitch deck delivery, CRM sync, and closed deal",
    order: 9,
  },
];

export const INITIAL_SAMPLE_REPORTS: UnifiedLeadIntelligenceReport[] = [
  {
    id: "lead-intel-1",
    businessName: "Apex Dental Studio",
    websiteUrl: "https://apexdentalstudio-demo.com",
    category: "Dentist / Healthcare",
    city: "Austin, TX",
    address: "1401 Congress Ave, Austin, TX 78701",
    googleRating: 4.8,
    reviewCount: 142,
    leadSources: ["Google Places API", "Yelp Directory", "Texas Dental Association"],
    pipelineStage: "score",
    verification: {
      businessExists: true,
      websiteReachable: true,
      phoneValid: true,
      emailValid: true,
      isDuplicate: false,
      currentlyOperating: true,
    },
    decisionMaker: {
      name: "Dr. Marcus Vance",
      title: "Practice Owner & Lead Dentist",
      email: "dr.vance@apexdentalstudio-demo.com",
      emailVerified: true,
      phone: "+1 (512) 555-0192",
      phoneVerified: true,
      linkedinUrl: "https://linkedin.com/in/dr-marcus-vance-demo",
      socialProfiles: [
        { platform: "Instagram", url: "https://instagram.com/apexdentalstudio" },
        { platform: "Facebook", url: "https://facebook.com/apexdentalstudio" },
      ],
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
      "Online appointment scheduling widget",
      "Mobile viewport responsive layout",
      "Patient intake digital forms",
      "Emergency call-to-action bar",
      "Schema.org LocalBusiness markup",
    ],
    redesignOpportunities: [
      "Replace legacy desktop flash banner with responsive hero video",
      "Add 1-click 'Book Consultation' sticky bottom bar on mobile",
      "Modernize typography to clean medical sans-serif font",
      "Embed live Google Review widget on homepage hero",
    ],
    techStack: {
      cms: "WordPress 4.9 (Outdated)",
      cmsVersion: "4.9.18",
      frameworks: ["jQuery 1.12", "Bootstrap 3"],
      analytics: ["Google Analytics (Universal - Sunsetted)"],
      marketingPixels: [],
      infrastructure: ["Apache / PHP 7.1"],
      outdatedFlags: ["Insecure PHP 7.1", "Sunset GA3 tracking code", "Uncompressed images"],
      score: 35,
    },
    seoSummary: {
      domainAgeYears: 9,
      organicKeywordsEst: 45,
      monthlyTrafficEst: 280,
      backlinksEst: 112,
      rankingOpportunities: [
        "cosmetic dentistry austin tx (Current Rank: #18 -> Target: Top 3)",
        "teeth whitening downtown austin (Current Rank: #24 -> Target: Top 5)",
        "emergency dentist 78701 (Current Rank: #12 -> Target: Top 3)",
      ],
    },
    competitors: [
      {
        competitorName: "Austin Smile Center",
        website: "https://austinsmilecenter.com",
        googleRating: 4.9,
        reviewCount: 310,
        designGrade: "A+",
        pageSpeedScore: 92,
        seoScore: 88,
        techStack: ["Next.js", "Typeform", "GA4"],
      },
      {
        competitorName: "Capital City Dental",
        website: "https://capitalcitydental.com",
        googleRating: 4.7,
        reviewCount: 185,
        designGrade: "B+",
        pageSpeedScore: 78,
        seoScore: 74,
        techStack: ["Webflow", "HubSpot"],
      },
    ],
    problemsIdentified: [
      {
        title: "Zero Mobile Responsive Layout",
        severity: "critical",
        description:
          "Website fails Google Mobile-Friendly test. Mobile visitors see tiny text and broken layout.",
      },
      {
        title: "No Direct Online Patient Booking",
        severity: "critical",
        description:
          "Patients must phone the front desk during business hours. Over 45% of dental leads drop off without instant online booking.",
      },
      {
        title: "Outdated WordPress 4.9 Engine",
        severity: "critical",
        description:
          "Unpatched security vulnerabilities present in PHP 7.1 and ancient WordPress core.",
      },
      {
        title: "Sunsetted Google Analytics Code",
        severity: "warning",
        description: "Using dead UA- tracking snippet; zero patient conversion tracking active.",
      },
    ],
    aiOpportunity: {
      leadScore: 91,
      priorityLevel: "CRITICAL",
      whyContactReasoning:
        "Apex Dental Studio is a high-revenue practice ($1.5M+ est.) with 140+ 5-star Google reviews, but losing over 50 patient leads monthly due to a broken 2014 mobile site that lacks online booking.",
      whatToSellRecommendation:
        "Complete Mobile-First Web Redesign + Online Patient Scheduling Portal + Local SEO Package",
      recommendedService: "Modern Practice Website + Booking Engine + Local SEO",
      estimatedContractValueMin: 3500,
      estimatedContractValueMax: 7500,
      bestDecisionMakerTitle: "Dr. Marcus Vance (Owner)",
      pitchAngle:
        "Show Dr. Vance live side-by-side comparison with Austin Smile Center showing how he is losing 40+ appointments monthly to competitors without mobile booking.",
    },
    outreach: {
      emailSubject: "Dr. Vance — quick mobile booking fix for Apex Dental Studio",
      emailBody:
        "Hi Dr. Vance,\n\nI noticed Apex Dental Studio has an impressive 4.8 rating with 140+ reviews in Austin, but when opening your site on a mobile phone, patients are unable to book appointments online or view your services clearly.\n\nWe built a quick 30-second mobile preview showing how adding instant 24/7 online booking could add 15-20 new patient consultations per month without extra staff workload.\n\nWould you be open to seeing a quick 2-minute mockup this week?\n\nBest regards,\nLeadVine Intelligence Team",
      smsText:
        "Hi Dr. Vance, noticed Apex Dental has 140+ 5-star reviews! Built a quick mockup showing how adding 24/7 online patient booking could boost new consults by 25%. Mind if I text you the preview link?",
      linkedInMessage:
        "Dr. Vance — congrats on the strong reputation for Apex Dental Studio in Austin! I created a 1-page digital transformation audit highlighting 3 mobile conversion upgrades your practice could launch in under 2 weeks. Open to taking a look?",
      coldCallScript: {
        opening:
          "Hi Dr. Vance, this is [Your Name] with LeadVine. I'll keep this brief — I noticed your dental practice has over 140 5-star reviews on Google, which is outstanding.",
        hook: "However, when testing your website on an iPhone, patients can't book appointments online after hours.",
        pitch:
          "We help top Austin dental practices convert 30% more web visitors by installing modern mobile booking portals. We've already prepared a complimentary interactive redesign mockup for Apex Dental.",
        objectionHandlers: [
          {
            objection: "We already have a web developer.",
            response:
              "Understood! Many practices do. We actually work alongside existing devs to plug in the 24/7 scheduling engine and SEO fixes. Can I email you our 1-page visual report so you have it on file?",
          },
          {
            objection: "Send me an email first.",
            response:
              "Will do right away. Should I send it to dr.vance@apexdentalstudio-demo.com? I'll include the 30-second video demo.",
          },
        ],
      },
      followUpSteps: [
        {
          day: 2,
          channel: "email",
          subjectOrNote: "Re: Dr. Vance — quick mobile booking fix",
          message:
            "Hi Dr. Vance, following up on my note below. Here is the 1-minute video breakdown of how Austin Smile Center captures mobile traffic in your zip code.",
        },
        {
          day: 5,
          channel: "sms",
          subjectOrNote: "Quick SMS check-in",
          message:
            "Dr. Vance — sent a quick video analysis to your email on Tuesday regarding mobile appointment booking for Apex Dental. Did you get a chance to review?",
        },
        {
          day: 8,
          channel: "linkedin",
          subjectOrNote: "LinkedIn soft outreach",
          message:
            "Hi Dr. Vance, wanted to make sure you saw our dental practice growth teardown. No pressure at all, happy to share the Figma prototype whenever convenient!",
        },
      ],
    },
    notes: "High potential target. Owner prefers direct video audits.",
    crmSynced: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "lead-intel-2",
    businessName: "Horizon Auto Care & Repair",
    websiteUrl: "https://horizonautocare-demo.com",
    category: "Auto Repair / Mechanics",
    city: "Denver, CO",
    address: "2840 Larimer St, Denver, CO 80205",
    googleRating: 4.6,
    reviewCount: 98,
    leadSources: ["Google Places", "YellowPages"],
    pipelineStage: "contact",
    verification: {
      businessExists: true,
      websiteReachable: true,
      phoneValid: true,
      emailValid: true,
      isDuplicate: false,
      currentlyOperating: true,
    },
    decisionMaker: {
      name: "Sam Higgins",
      title: "General Manager / Founder",
      email: "sam@horizonautocare-demo.com",
      emailVerified: true,
      phone: "+1 (303) 555-0144",
      phoneVerified: true,
    },
    auditScores: {
      mobileUx: 45,
      design: 35,
      performance: 28,
      seo: 48,
      accessibility: 32,
      trust: 70,
      conversion: 22,
      security: 45,
    },
    missingFeatures: [
      "Service price estimator",
      "SMS appointment reminders",
      "Customer trust badges",
      "SSL certificate",
    ],
    redesignOpportunities: [
      "Add 1-click quote request form",
      "Highlight fleet servicing capabilities",
    ],
    techStack: {
      frameworks: [],
      analytics: [],
      marketingPixels: [],
      infrastructure: ["Apache"],
      outdatedFlags: ["No SSL / HTTP only", "Missing viewport meta"],
      score: 22,
    },
    seoSummary: {
      domainAgeYears: 12,
      organicKeywordsEst: 22,
      monthlyTrafficEst: 140,
      backlinksEst: 45,
      rankingOpportunities: ["brake repair denver 80205", "auto mechanic larimer st"],
    },
    competitors: [
      {
        competitorName: "Denver Brake & Auto",
        website: "https://denverbrake.com",
        googleRating: 4.8,
        reviewCount: 240,
        designGrade: "A",
        pageSpeedScore: 85,
        seoScore: 82,
        techStack: ["WordPress", "Square"],
      },
    ],
    problemsIdentified: [
      {
        title: "Insecure Connection (HTTP / No SSL)",
        severity: "critical",
        description:
          "Browsers mark the site 'Not Secure', turning away customers who want to enter phone numbers.",
      },
      {
        title: "No Instant Quote Request Form",
        severity: "critical",
        description:
          "Customers have to call. Over 50% of drivers searching for repair quotes leave without calling.",
      },
    ],
    aiOpportunity: {
      leadScore: 88,
      priorityLevel: "HIGH",
      whyContactReasoning:
        "Established Denver auto shop with great reputation, but HTTP insecurity flag deters online quote seekers.",
      whatToSellRecommendation:
        "Secure SSL Upgrade + Instant Repair Quote Widget + Google Map Optimization",
      recommendedService: "Auto Shop Lead Capture Suite",
      estimatedContractValueMin: 2000,
      estimatedContractValueMax: 4500,
      bestDecisionMakerTitle: "Sam Higgins (Founder)",
      pitchAngle:
        "Fix browser 'Not Secure' warnings and capture 20+ extra online quote leads monthly.",
    },
    outreach: {
      emailSubject: "Sam — Browser security alert on Horizon Auto Care website",
      emailBody:
        "Hi Sam,\n\nWhile checking top rated auto repair shops in Denver, I noticed Horizon Auto Care has a 4.6 rating on Google. However, Google Chrome currently shows a red 'Not Secure' warning on your website due to a missing SSL certificate.\n\nWe can fix this and add a 1-click Instant Repair Quote form for Horizon Auto Care in under 48 hours.\n\nWould you like me to send over a quick quote?\n\nBest,\nLeadVine Team",
      smsText:
        "Hi Sam! Noticed Horizon Auto Care has great reviews in Denver. Quick heads up: browsers are showing a 'Not Secure' warning on your site. We can fix it in 24 hrs. Want a quick preview?",
      linkedInMessage:
        "Sam — reached out regarding Horizon Auto Care's web lead capture. Let me know if you'd like to see our auto shop redesign template!",
      coldCallScript: {
        opening:
          "Hi Sam, this is [Your Name] from LeadVine. I saw Horizon Auto Care's strong Google reviews in Denver.",
        hook: "I noticed your website is triggering 'Not Secure' warnings in Chrome, which hurts your search ranking.",
        pitch:
          "We specialize in setting up secure, instant quote websites for auto shops that generate 15-20 extra service inquiries a month.",
        objectionHandlers: [
          {
            objection: "We are too busy with word of mouth.",
            response:
              "That's the best problem to have! Our automated quote widget actually screens leads and filters out tire-kickers before they reach your front desk.",
          },
        ],
      },
      followUpSteps: [
        {
          day: 3,
          channel: "email",
          subjectOrNote: "Re: Security alert on Horizon Auto Care",
          message:
            "Hi Sam, just checking if you saw my note about fixing the SSL warning on your website. Happy to help!",
        },
      ],
    },
    notes: "Followed up via email.",
    crmSynced: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const STORAGE_KEY = "leadvine_intelligence_reports_v1";

export function loadIntelligenceReports(): UnifiedLeadIntelligenceReport[] {
  if (typeof window === "undefined") return INITIAL_SAMPLE_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_REPORTS));
      return INITIAL_SAMPLE_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_REPORTS;
  }
}

export function saveIntelligenceReports(reports: UnifiedLeadIntelligenceReport[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Failed to save intelligence reports to storage:", err);
  }
}

export function generateIntelligenceReportForLead(basicLead: {
  id?: string;
  name: string;
  website?: string;
  phone?: string;
  city?: string;
  category?: string;
  email?: string;
}): UnifiedLeadIntelligenceReport {
  const name = basicLead.name || "Business Prospect";
  const domain = basicLead.website
    ? basicLead.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const websiteUrl = basicLead.website || `https://${domain}`;
  const city = basicLead.city || "Austin, TX";
  const category = basicLead.category || "Local Business";

  // Synthesize realistic audit metrics
  const mobileUx = Math.floor(Math.random() * 40) + 25;
  const design = Math.floor(Math.random() * 35) + 30;
  const performance = Math.floor(Math.random() * 30) + 25;
  const seo = Math.floor(Math.random() * 35) + 35;
  const accessibility = Math.floor(Math.random() * 30) + 35;
  const trust = Math.floor(Math.random() * 30) + 55;
  const conversion = Math.floor(Math.random() * 35) + 20;
  const security = Math.floor(Math.random() * 40) + 40;

  const overallScore = Math.round(100 - (mobileUx + design + performance + seo + conversion) / 5);

  return {
    id: basicLead.id || `intel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    businessName: name,
    websiteUrl,
    category,
    city,
    address: `${Math.floor(Math.random() * 800) + 100} Main St, ${city}`,
    googleRating: Number((Math.random() * 0.8 + 4.1).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 150) + 20,
    leadSources: ["Google Places API", "Public Directory", "Domain Intelligence"],
    pipelineStage: "discover",
    verification: {
      businessExists: true,
      websiteReachable: true,
      phoneValid: !!basicLead.phone,
      emailValid: !!basicLead.email,
      isDuplicate: false,
      currentlyOperating: true,
    },
    decisionMaker: {
      name: `${["John", "David", "Sarah", "Michael", "Elena"][Math.floor(Math.random() * 5)]} ${
        ["Smith", "Johnson", "Miller", "Davis", "Taylor"][Math.floor(Math.random() * 5)]
      }`,
      title: "Business Owner / Managing Director",
      email: basicLead.email || `owner@${domain}`,
      emailVerified: true,
      phone: basicLead.phone || "+1 (512) 555-0100",
      phoneVerified: true,
      linkedinUrl: `https://linkedin.com/company/${domain.replace(/\..*/, "")}`,
    },
    auditScores: {
      mobileUx,
      design,
      performance,
      seo,
      accessibility,
      trust,
      conversion,
      security,
    },
    missingFeatures: [
      "Mobile responsive layout",
      "Online booking / inquiry widget",
      "SSL Certificate & HTTPS redirect",
      "Schema LocalBusiness structured markup",
      "Automated lead capture form",
    ],
    redesignOpportunities: [
      "Modernize legacy hero section with high-converting CTA",
      "Implement 1-click mobile phone & WhatsApp contact bar",
      "Optimize images to WebP format for 3x speed boost",
      "Add interactive customer review carousel",
    ],
    techStack: {
      cms: "Legacy HTML / Custom PHP",
      frameworks: ["jQuery 1.x"],
      analytics: [],
      marketingPixels: [],
      infrastructure: ["Shared Apache"],
      outdatedFlags: ["No SSL", "Deprecated jQuery version", "Slow server response time"],
      score: 30,
    },
    seoSummary: {
      domainAgeYears: Math.floor(Math.random() * 8) + 3,
      organicKeywordsEst: Math.floor(Math.random() * 50) + 10,
      monthlyTrafficEst: Math.floor(Math.random() * 400) + 50,
      backlinksEst: Math.floor(Math.random() * 80) + 15,
      rankingOpportunities: [
        `${category.toLowerCase()} near me in ${city}`,
        `best ${category.toLowerCase()} ${city}`,
        `top rated ${category.toLowerCase()}`,
      ],
    },
    competitors: [
      {
        competitorName: `Top ${category} Competitor`,
        website: `https://top${domain}`,
        googleRating: 4.9,
        reviewCount: 220,
        designGrade: "A",
        pageSpeedScore: 88,
        seoScore: 85,
        techStack: ["Next.js", "GA4", "Tailwind"],
      },
    ],
    problemsIdentified: [
      {
        title: "Poor Mobile Usability",
        severity: "critical",
        description: `Website scored ${mobileUx}/100 on Mobile UX test. Text is unreadable without zooming.`,
      },
      {
        title: "Low Lead Conversion Rate",
        severity: "critical",
        description:
          "Missing clear Call to Action above the fold and lacking online inquiry options.",
      },
      {
        title: "Page Performance Bottlenecks",
        severity: "warning",
        description: `Page speed score of ${performance}/100 due to uncompressed images and bloated legacy scripts.`,
      },
    ],
    aiOpportunity: {
      leadScore: overallScore,
      priorityLevel: overallScore >= 85 ? "CRITICAL" : overallScore >= 70 ? "HIGH" : "MEDIUM",
      whyContactReasoning: `${name} has a strong local reputation but loses up to 60% of web visitors due to an unoptimized mobile experience (${mobileUx}/100) and missing online booking options.`,
      whatToSellRecommendation:
        "High-Converting Mobile Website Redesign + Local SEO & Lead Capture Suite",
      recommendedService: "Agency Website Redesign & Conversion Package",
      estimatedContractValueMin: 2500,
      estimatedContractValueMax: 6000,
      bestDecisionMakerTitle: "Business Owner",
      pitchAngle: `Help ${name} capture 15-25 more qualified monthly leads by deploying a modern mobile-first booking experience.`,
    },
    outreach: {
      emailSubject: `Quick mobile design audit for ${name}`,
      emailBody: `Hi,\n\nI was looking at top-rated ${category} businesses in ${city} and noticed ${name}.\n\nWhen reviewing your site on a mobile device, I noticed patients/customers aren't able to easily book or contact you online.\n\nWe prepared a complimentary interactive redesign mockup showing how adding a 24/7 mobile booking widget could generate 15-25 extra inquiries monthly.\n\nWould you be open to a 2-minute video preview?\n\nBest,\nLeadVine Intelligence`,
      smsText: `Hi! Noticed ${name} has great local reviews in ${city}. Built a quick mockup showing how adding a 1-click mobile booking widget could boost inquiries. Mind if I text you the link?`,
      linkedInMessage: `Reached out regarding ${name}'s digital presence. We've built a 1-page growth teardown for your team!`,
      coldCallScript: {
        opening: `Hi, this is [Your Name] from LeadVine. I saw ${name}'s great customer reviews in ${city}.`,
        hook: `I noticed your website isn't optimized for mobile users searching on phones.`,
        pitch: `We build modern mobile-first booking sites that help local businesses convert 30% more web traffic into paying clients.`,
        objectionHandlers: [
          {
            objection: "We already have a website.",
            response:
              "Understood! Our focus is purely adding the instant mobile booking engine to double your lead conversions. Can I send a 30-second video demo?",
          },
        ],
      },
      followUpSteps: [
        {
          day: 3,
          channel: "email",
          subjectOrNote: `Re: Quick mobile design audit for ${name}`,
          message: `Hi, following up on my previous note. Would love to share our 30-second visual audit!`,
        },
      ],
    },
    crmSynced: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
