import { DomainIntelligence } from "../types";

export function analyzeDomainIntelligence(domainOrUrl: string): DomainIntelligence {
  const cleanDomain = domainOrUrl
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

  let hash = 0;
  for (let i = 0; i < cleanDomain.length; i++) {
    hash = (hash << 5) - hash + cleanDomain.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  const registrars = [
    "GoDaddy.com LLC",
    "Namecheap Inc",
    "Google Domains / Squarespace",
    "Network Solutions",
    "Tucows Domains",
  ];
  const hostings = [
    "WP Engine",
    "GoDaddy Hosting",
    "Bluehost Inc",
    "Cloudflare Pages",
    "Amazon Web Services",
    "Hostinger",
  ];
  const cdns = ["Cloudflare CDN", "Fastly", "Amazon CloudFront", "Bunny.net", "None"];

  const isExpired = abs % 10 === 0;
  const isExpiringSoon = !isExpired && abs % 7 === 0;
  const status = isExpired ? "expired" : isExpiringSoon ? "expiring_soon" : "active";

  const domainAgeYears = 2 + (abs % 18);
  const registrar = registrars[abs % registrars.length];
  const hostingProvider = isExpired ? "None (DNS Unresolved)" : hostings[abs % hostings.length];
  const cdn = isExpired ? "None" : cdns[abs % cdns.length];

  const expYear = isExpired ? 2025 : 2026 + (abs % 5);
  const expirationDate = `${expYear}-${(abs % 12) + 1}-15`;

  const dnsRecords = [
    { type: "A", value: isExpired ? "Unbound (0.0.0.0)" : `192.0.2.${abs % 255}` },
    { type: "MX", value: `mail.${cleanDomain}` },
    { type: "TXT", value: "v=spf1 include:_spf.google.com ~all" },
    { type: "NS", value: `ns1.${registrar.toLowerCase().split(" ")[0]}.com` },
  ];

  return {
    domain: cleanDomain,
    status,
    expirationDate,
    registrar,
    domainAgeYears,
    dnsRecords,
    hostingProvider,
    cdn,
    hasSsl: !isExpired && abs % 4 !== 0,
    sslValidUntil: `${expYear}-12-31`,
    isHighOpportunity: isExpired || isExpiringSoon || domainAgeYears > 10,
  };
}
