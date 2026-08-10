export interface ImportedLead {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  city?: string;
  address?: string;
  category?: string;
  email?: string;
  notes?: string;
  status?: string;
  created_at: string;
}

export interface DomainIntelligence {
  domain: string;
  status: "active" | "expired" | "expiring_soon" | "unregistered" | "unknown";
  expirationDate?: string;
  registrar?: string;
  domainAgeYears?: number;
  dnsRecords?: { type: string; value: string }[];
  hostingProvider?: string;
  cdn?: string;
  hasSsl: boolean;
  sslValidUntil?: string;
  isHighOpportunity: boolean;
}

export interface TechStackDetection {
  cms?: string;
  cmsVersion?: string;
  frameworks: string[];
  analytics: string[];
  marketingPixels: string[];
  infrastructure: string[];
  outdatedFlags: string[];
  score: number;
}

export interface AuditSectionAnalysis {
  name: string;
  score: number; // 0 - 100
  status: "good" | "warning" | "critical";
  details: string;
  recommendations: string[];
}

export interface AiWebsiteAudit {
  id: string;
  url: string;
  businessName: string;
  homepage: AuditSectionAnalysis;
  heroSection: AuditSectionAnalysis;
  navigation: AuditSectionAnalysis;
  typography: AuditSectionAnalysis;
  spacingAndLayout: AuditSectionAnalysis;
  callToAction: AuditSectionAnalysis;
  footerAndTrust: AuditSectionAnalysis;
  mobileUx: AuditSectionAnalysis;
  overallScore: number;
  summary: string;
}

export interface OpportunityScoreBreakdown {
  designScore: number;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  conversionScore: number;
  trustScore: number;
  brandScore: number;
  overallScore: number; // 0 - 100
  starRating: 1 | 2 | 3 | 4 | 5;
  classification:
    | "★★★★★ Excellent Prospect"
    | "★★★★☆ Strong Prospect"
    | "★★★☆☆ Moderate Opportunity"
    | "★★☆☆☆ Low Urgency"
    | "★☆☆☆☆ Low Potential";
  aiReasoning: string;
  pitchAngles: string[];
}

export interface RedesignProposal {
  id: string;
  leadName: string;
  websiteUrl: string;
  heroHeadline: string;
  heroSubtitle: string;
  primaryCtaText: string;
  suggestedColorPalette: { name: string; hex: string; role: string }[];
  suggestedTypography: { displayFont: string; bodyFont: string; reasoning: string };
  conversionFixes: string[];
  suggestedPages: string[];
  layoutStructure: { section: string; description: string }[];
}

export interface CompetitorBenchmark {
  competitorName: string;
  website: string;
  googleRating: number;
  reviewCount: number;
  designGrade: string;
  pageSpeedScore: number;
  seoScore: number;
  techStack: string[];
}

export type PipelineStage =
  | "discover"
  | "verify"
  | "enrich"
  | "analyze"
  | "score"
  | "prioritize"
  | "contact"
  | "track"
  | "convert";

export interface PipelineStageInfo {
  id: PipelineStage;
  label: string;
  description: string;
  order: number;
}

export interface WebAuditScores {
  mobileUx: number;
  design: number;
  performance: number;
  seo: number;
  accessibility: number;
  trust: number;
  conversion: number;
  security: number;
}

export interface DecisionMakerInfo {
  name: string;
  title: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  linkedinUrl?: string;
  socialProfiles?: { platform: string; url: string }[];
}

export interface LeadVerificationStatus {
  businessExists: boolean;
  websiteReachable: boolean;
  phoneValid: boolean;
  emailValid: boolean;
  isDuplicate: boolean;
  currentlyOperating: boolean;
}

export interface AiSalesOpportunity {
  leadScore: number; // 0 - 100
  priorityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  whyContactReasoning: string;
  whatToSellRecommendation: string;
  recommendedService: string;
  estimatedContractValueMin: number;
  estimatedContractValueMax: number;
  bestDecisionMakerTitle: string;
  pitchAngle: string;
}

export interface OutreachSequence {
  emailSubject: string;
  emailBody: string;
  smsText: string;
  linkedInMessage: string;
  coldCallScript: {
    opening: string;
    hook: string;
    pitch: string;
    objectionHandlers: { objection: string; response: string }[];
  };
  followUpSteps: {
    day: number;
    channel: "email" | "sms" | "linkedin";
    subjectOrNote: string;
    message: string;
  }[];
}

export interface UnifiedLeadIntelligenceReport {
  id: string;
  businessName: string;
  websiteUrl: string;
  category: string;
  city: string;
  address?: string;
  googleRating?: number;
  reviewCount?: number;
  leadSources: string[]; // e.g. ["Google Places", "Yelp", "Public Directory"]

  pipelineStage: PipelineStage;
  verification: LeadVerificationStatus;
  decisionMaker: DecisionMakerInfo;

  auditScores: WebAuditScores;
  missingFeatures: string[];
  redesignOpportunities: string[];

  techStack: TechStackDetection;
  seoSummary: {
    domainAgeYears: number;
    organicKeywordsEst: number;
    monthlyTrafficEst: number;
    backlinksEst: number;
    rankingOpportunities: string[];
  };
  competitors: CompetitorBenchmark[];

  problemsIdentified: {
    title: string;
    severity: "critical" | "warning" | "info";
    description: string;
  }[];
  aiOpportunity: AiSalesOpportunity;
  outreach: OutreachSequence;

  notes?: string;
  crmSynced?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrioritizedLead {
  id: string;
  name: string;
  website: string;
  phone?: string;
  city?: string;
  opportunityScore: number;
  starRating: number;
  rank: number;
  primaryReason: string;
  estimatedContractValue: number;
  actionStatus: "uncontacted" | "analyzed" | "pitch_sent" | "meeting_booked" | "won";
}

export interface GeneratedEmailPitch {
  id: string;
  leadName: string;
  recipientEmail?: string;
  subjectLine: string;
  bodyText: string;
  tone: "consultative" | "direct" | "video_teaser" | "wireframe_pitch";
  keyIssuesHighlighted: string[];
  suggestedFollowUpDays: number;
}

export interface CampaignStep {
  id: string;
  stepNumber: number;
  type: "email" | "delay" | "followup" | "reminder";
  title: string;
  delayDays?: number;
  subject?: string;
  templateBody?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  totalProspects: number;
  sentCount: number;
  openRatePct: number;
  clickRatePct: number;
  replyRatePct: number;
  meetingsBooked: number;
  steps: CampaignStep[];
}

export interface ProposalDocument {
  id: string;
  clientName: string;
  websiteUrl: string;
  agencyName: string;
  auditSummary: string;
  identifiedProblems: string[];
  proposedSolutions: string[];
  timelineWeeks: number;
  investmentTiers: {
    tierName: string;
    price: number;
    deliverables: string[];
    recommended?: boolean;
  }[];
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: "lead_imported" | "scan_completed" | "score_calculated" | "email_opened";
  condition: string;
  actions: string[];
  enabled: boolean;
}

export interface WhiteLabelConfig {
  agencyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customEmailSignature: string;
  proposalFooterText: string;
  hideLeadVineBranding: boolean;
}
