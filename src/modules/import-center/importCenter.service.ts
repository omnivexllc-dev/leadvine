import { ImportedLead } from "../types";
import Papa from "papaparse";

export interface ColumnMap {
  name: string;
  website: string;
  phone: string;
  city: string;
  address: string;
  category: string;
  email: string;
  notes: string;
}

export interface ParseResult {
  headers: string[];
  rawRows: Record<string, string>[];
  mappedLeads: ImportedLead[];
  duplicatesCount: number;
  invalidCount: number;
}

export function parseRawCsv(csvText: string, mapping: Partial<ColumnMap>): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields || [];
  const rawRows = parsed.data || [];

  let duplicatesCount = 0;
  let invalidCount = 0;
  const seenDomains = new Set<string>();

  const mappedLeads: ImportedLead[] = [];

  rawRows.forEach((row, idx) => {
    const name =
      row[mapping.name || ""] ||
      row["Name"] ||
      row["Company"] ||
      row["Business Name"] ||
      `Lead #${idx + 1}`;
    let website = row[mapping.website || ""] || row["Website"] || row["URL"] || row["Domain"] || "";
    if (website && !website.startsWith("http")) {
      website = `https://${website}`;
    }

    const domain = website
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase();

    if (domain && seenDomains.has(domain)) {
      duplicatesCount++;
    } else if (domain) {
      seenDomains.add(domain);
    }

    if (!name && !website) {
      invalidCount++;
      return;
    }

    mappedLeads.push({
      id: `imported-${Date.now()}-${idx}`,
      name: name.trim(),
      website: website.trim(),
      phone: row[mapping.phone || ""] || row["Phone"] || row["Telephone"] || "",
      city: row[mapping.city || ""] || row["City"] || row["Location"] || "",
      address: row[mapping.address || ""] || row["Address"] || "",
      category: row[mapping.category || ""] || row["Category"] || row["Industry"] || "General",
      email: row[mapping.email || ""] || row["Email"] || row["Contact Email"] || "",
      notes: row[mapping.notes || ""] || row["Notes"] || "",
      status: "imported",
      created_at: new Date().toISOString(),
    });
  });

  return {
    headers,
    rawRows,
    mappedLeads,
    duplicatesCount,
    invalidCount,
  };
}

export const SAMPLE_CSV_TEMPLATE = `Business Name,Website,Phone,City,Category,Email
Apex Plumbing,https://apexplumbingdemo.com,(555) 234-5678,Austin,Plumbing,info@apexplumbingdemo.com
Vanguard Law Group,vanguardlaw.co,(555) 987-6543,Denver,Legal,contact@vanguardlaw.co
Sunstate Dental,,(555) 456-7890,Phoenix,Healthcare,drsmith@sunstatedental.com
Metro Bistro,metrobistronew.com,(555) 321-7654,Seattle,Restaurant,gm@metrobistro.com
Harbor Construction,harborbuilds.org,(555) 888-9999,San Diego,Construction,quotes@harborbuilds.org`;
