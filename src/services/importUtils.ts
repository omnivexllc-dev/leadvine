import Papa from "papaparse";
import { FieldMapping } from "@/components/leads/LeadImport";

export interface CSVParseResult {
  headers: string[];
  data: Record<string, unknown>[];
  errors: Papa.ParseError[];
}

export interface HeaderValidationResult {
  isValid: boolean;
  missingRequired: string[];
  mappedFieldsCount: number;
  warnings: string[];
}

/**
 * Parses raw CSV string or File using PapaParse
 */
export function parseCSVData(content: string | File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(content as unknown as File, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({
          headers,
          data: results.data,
          errors: results.errors,
        });
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * Automatically suggests column mappings from detected CSV headers to leads schema fields
 */
export function autoSuggestFieldMapping(rawHeaders: string[]): FieldMapping {
  const lowerHeaders = rawHeaders.map((h) => h.trim().toLowerCase());
  const autoMap: FieldMapping = {
    name: "",
    domain: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    category: "",
    notes: "",
    estimated_contract_value: "",
    status: "",
  };

  const findMatch = (candidates: string[]) => {
    const idx = lowerHeaders.findIndex((h) => candidates.some((c) => h === c || h.includes(c)));
    return idx !== -1 ? rawHeaders[idx] : "";
  };

  autoMap.name = findMatch([
    "company",
    "business",
    "name",
    "organization",
    "lead name",
    "company_name",
  ]);
  autoMap.email = findMatch(["email", "e-mail", "mail", "contact email"]);
  autoMap.phone = findMatch(["phone", "telephone", "mobile", "contact phone", "phone number"]);
  autoMap.website = findMatch(["website", "site", "url", "web", "homepage"]);
  autoMap.domain = findMatch(["domain", "web domain"]);
  autoMap.city = findMatch(["city", "town", "location", "municipality"]);
  autoMap.address = findMatch(["address", "street", "street address"]);
  autoMap.category = findMatch(["category", "industry", "type", "niche", "sector"]);
  autoMap.notes = findMatch(["notes", "comments", "description", "details"]);
  autoMap.estimated_contract_value = findMatch([
    "value",
    "contract",
    "amount",
    "budget",
    "estimated value",
    "revenue",
  ]);
  autoMap.status = findMatch(["status", "stage", "lead status"]);

  return autoMap;
}

/**
 * Validates selected header mappings against required database schema rules
 */
export function validateHeaderMappings(mapping: FieldMapping): HeaderValidationResult {
  const missingRequired: string[] = [];
  const warnings: string[] = [];

  if (!mapping.name) {
    missingRequired.push("Lead / Company Name");
  }

  if (!mapping.email && !mapping.phone && !mapping.website) {
    warnings.push(
      "No contact method (Email, Phone, or Website) is mapped. Leads may lack outreach details.",
    );
  }

  const mappedFieldsCount = Object.values(mapping).filter((v) => Boolean(v)).length;

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    mappedFieldsCount,
    warnings,
  };
}

/**
 * Extracts clean domain name from a website URL string
 */
export function extractCleanDomain(websiteUrl: string): string {
  if (!websiteUrl) return "";
  try {
    const formattedUrl = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    const urlObj = new URL(formattedUrl);
    return urlObj.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return websiteUrl
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .toLowerCase();
  }
}

export interface ExistingLeadRecord {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  domain?: string;
}

export interface IncomingLeadCandidate {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  domain?: string;
}

export interface DuplicateMatchResult {
  isDuplicate: boolean;
  reason?: string;
  duplicateType?: "database" | "in_file";
  matchedDbLead?: ExistingLeadRecord;
}

/**
 * Detects duplicate leads by cross-referencing incoming candidates against
 * existing database records and checking for duplicates within the incoming set.
 *
 * Primary matching rules:
 * 1. Matching Domain or clean Website hostname against database leads
 * 2. Matching Email address against database leads
 * 3. Matching Clean Phone digits against database leads
 * 4. Matching Company / Lead Name against database leads
 * 5. Intra-file duplicate detection (duplicates within the same uploaded file)
 */
export function detectDuplicateLeads(
  incomingRows: IncomingLeadCandidate[],
  existingDbLeads: ExistingLeadRecord[] = [],
): DuplicateMatchResult[] {
  // Build lookup maps for existing DB records
  const dbEmails = new Map<string, ExistingLeadRecord>();
  const dbDomains = new Map<string, ExistingLeadRecord>();
  const dbPhones = new Map<string, ExistingLeadRecord>();
  const dbNames = new Map<string, ExistingLeadRecord>();

  for (const lead of existingDbLeads) {
    if (lead.email) {
      dbEmails.set(lead.email.toLowerCase().trim(), lead);
    }
    if (lead.domain) {
      dbDomains.set(lead.domain.toLowerCase().trim(), lead);
    }
    if (lead.website) {
      const cleanDom = extractCleanDomain(lead.website);
      if (cleanDom) {
        dbDomains.set(cleanDom, lead);
      }
    }
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, "");
      if (cleanPhone.length >= 7) {
        dbPhones.set(cleanPhone, lead);
      }
    }
    if (lead.name) {
      dbNames.set(lead.name.toLowerCase().trim(), lead);
    }
  }

  // Tracking sets for in-file duplicates
  const seenEmails = new Set<string>();
  const seenDomains = new Set<string>();
  const seenPhones = new Set<string>();
  const seenNames = new Set<string>();

  return incomingRows.map((candidate) => {
    const email = candidate.email?.toLowerCase().trim() || "";
    let domain = candidate.domain?.toLowerCase().trim() || "";
    if (!domain && candidate.website) {
      domain = extractCleanDomain(candidate.website);
    }
    const cleanPhone = candidate.phone ? candidate.phone.replace(/\D/g, "") : "";
    const name = candidate.name?.toLowerCase().trim() || "";

    // 1. Cross-reference Database Duplicates
    if (domain && dbDomains.has(domain)) {
      return {
        isDuplicate: true,
        reason: `Domain (${domain}) matches an existing record in database`,
        duplicateType: "database",
        matchedDbLead: dbDomains.get(domain),
      };
    }

    if (email && dbEmails.has(email)) {
      return {
        isDuplicate: true,
        reason: `Email (${email}) matches an existing lead in database`,
        duplicateType: "database",
        matchedDbLead: dbEmails.get(email),
      };
    }

    if (cleanPhone && cleanPhone.length >= 7 && dbPhones.has(cleanPhone)) {
      return {
        isDuplicate: true,
        reason: `Phone number matches an existing lead in database`,
        duplicateType: "database",
        matchedDbLead: dbPhones.get(cleanPhone),
      };
    }

    if (name && dbNames.has(name)) {
      return {
        isDuplicate: true,
        reason: `Company name (${candidate.name.trim()}) matches existing lead in database`,
        duplicateType: "database",
        matchedDbLead: dbNames.get(name),
      };
    }

    // 2. Intra-file Duplicates
    if (domain && seenDomains.has(domain)) {
      return {
        isDuplicate: true,
        reason: `Duplicate domain (${domain}) found within this import file`,
        duplicateType: "in_file",
      };
    }

    if (email && seenEmails.has(email)) {
      return {
        isDuplicate: true,
        reason: `Duplicate email (${email}) found within this import file`,
        duplicateType: "in_file",
      };
    }

    if (cleanPhone && cleanPhone.length >= 7 && seenPhones.has(cleanPhone)) {
      return {
        isDuplicate: true,
        reason: `Duplicate phone number found within this import file`,
        duplicateType: "in_file",
      };
    }

    if (name && seenNames.has(name)) {
      return {
        isDuplicate: true,
        reason: `Duplicate company name (${candidate.name.trim()}) found within this import file`,
        duplicateType: "in_file",
      };
    }

    // Mark seen if not duplicate
    if (domain) seenDomains.add(domain);
    if (email) seenEmails.add(email);
    if (cleanPhone && cleanPhone.length >= 7) seenPhones.add(cleanPhone);
    if (name) seenNames.add(name);

    return { isDuplicate: false };
  });
}
