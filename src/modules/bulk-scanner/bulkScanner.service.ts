export interface BulkScanCheckResult {
  url: string;
  businessName: string;
  isLive: boolean;
  httpStatus: number;
  sslValid: boolean;
  responseTimeMs: number;
  dnsResolved: boolean;
  scores: {
    performance: number; // 0-100
    accessibility: number; // 0-100
    seo: number; // 0-100
    security: number; // 0-100
    trust: number; // 0-100
    branding: number; // 0-100
    ctaPresence: number; // 0-100
    mobileUx: number; // 0-100
  };
  overallQuality: number;
  redesignOpportunity: "High" | "Medium" | "Low";
  scannedAt: string;
}

const scanCache = new Map<string, BulkScanCheckResult>();

export function scanSingleWebsiteSimulated(
  url: string,
  businessName: string,
  forceRescan = false,
): BulkScanCheckResult {
  const normalizedUrl = url.trim().toLowerCase();

  if (!forceRescan && scanCache.has(normalizedUrl)) {
    return scanCache.get(normalizedUrl)!;
  }

  // Generate deterministic realistic scores based on URL length/hash
  let hash = 0;
  for (let i = 0; i < normalizedUrl.length; i++) {
    hash = (hash << 5) - hash + normalizedUrl.charCodeAt(i);
    hash |= 0;
  }

  const absHash = Math.abs(hash);
  const isLive = absHash % 12 !== 0; // ~92% live
  const httpStatus = isLive ? 200 : absHash % 2 === 0 ? 404 : 500;
  const sslValid = isLive && absHash % 5 !== 0;
  const responseTimeMs = isLive ? 120 + (absHash % 1400) : 0;
  const dnsResolved = isLive;

  const perf = isLive ? 30 + (absHash % 60) : 0;
  const access = isLive ? 40 + (absHash % 50) : 0;
  const seo = isLive ? 35 + (absHash % 55) : 0;
  const sec = sslValid ? 80 + (absHash % 20) : 20;
  const trust = isLive ? 25 + (absHash % 65) : 10;
  const branding = isLive ? 30 + (absHash % 55) : 0;
  const cta = isLive ? 20 + (absHash % 70) : 0;
  const mobile = isLive ? 35 + (absHash % 50) : 0;

  const overallQuality = isLive
    ? Math.round((perf + access + seo + trust + branding + cta + mobile) / 7)
    : 0;

  const redesignOpportunity =
    !isLive || overallQuality < 55 ? "High" : overallQuality < 75 ? "Medium" : "Low";

  const result: BulkScanCheckResult = {
    url,
    businessName,
    isLive,
    httpStatus,
    sslValid,
    responseTimeMs,
    dnsResolved,
    scores: {
      performance: perf,
      accessibility: access,
      seo,
      security: sec,
      trust,
      branding,
      ctaPresence: cta,
      mobileUx: mobile,
    },
    overallQuality,
    redesignOpportunity,
    scannedAt: new Date().toISOString(),
  };

  scanCache.set(normalizedUrl, result);
  return result;
}
