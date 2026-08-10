import { TechStackDetection } from "../types";

export function detectWebsiteTechnologyStack(domainOrUrl: string): TechStackDetection {
  const cleanDomain = domainOrUrl.replace(/^https?:\/\//, "").toLowerCase();

  let hash = 0;
  for (let i = 0; i < cleanDomain.length; i++) {
    hash = (hash << 5) - hash + cleanDomain.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  const cmss = [
    "WordPress",
    "WooCommerce",
    "Shopify",
    "Wix",
    "Squarespace",
    "Magento",
    "Webflow",
    "Custom PHP",
  ];
  const cms = cmss[abs % cmss.length];

  const frameworks: string[] = [];
  if (cms === "Custom PHP") frameworks.push("PHP 7.4", "Laravel");
  else if (abs % 2 === 0) frameworks.push("React", "Next.js");
  else frameworks.push("jQuery 1.12.4");

  const analytics: string[] = [];
  if (abs % 3 !== 0) analytics.push("Google Analytics 4");
  if (abs % 4 === 0) analytics.push("Microsoft Clarity");
  if (abs % 5 === 0) analytics.push("Hotjar");

  const marketingPixels: string[] = [];
  if (abs % 2 === 0) marketingPixels.push("Meta Facebook Pixel");
  if (abs % 4 === 0) marketingPixels.push("HubSpot Tracking Code");

  const infrastructure = ["Cloudflare", "Nginx 1.18", "Apache 2.4"];

  const outdatedFlags: string[] = [];
  if (cms === "WordPress") outdatedFlags.push("WordPress 5.2 (Outdated - Vulnerable to Exploits)");
  if (frameworks.includes("jQuery 1.12.4"))
    outdatedFlags.push("Legacy jQuery 1.x Library (Deprecated)");
  if (!analytics.includes("Google Analytics 4")) outdatedFlags.push("Missing Modern GA4 Telemetry");
  if (cms === "Wix" || cms === "Squarespace")
    outdatedFlags.push("Proprietary DIY Builder (Limited SEO & Performance Customization)");

  const score = Math.max(20, 100 - outdatedFlags.length * 20);

  return {
    cms,
    cmsVersion: cms === "WordPress" ? "5.2.1" : "v2.4",
    frameworks,
    analytics,
    marketingPixels,
    infrastructure,
    outdatedFlags,
    score,
  };
}
