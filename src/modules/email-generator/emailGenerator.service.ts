import { GeneratedEmailPitch } from "../types";

export function generatePersonalizedColdEmail(
  businessName: string,
  websiteUrl: string,
  city = "Austin",
  tone: GeneratedEmailPitch["tone"] = "consultative",
): GeneratedEmailPitch {
  const subjectLines = {
    consultative: `Quick question regarding ${businessName}'s website experience`,
    direct: `Redesign proposal for ${websiteUrl} (Boost inbound appointments)`,
    video_teaser: `90-second video audit for ${businessName}`,
    wireframe_pitch: `New mobile homepage concept for ${businessName}`,
  };

  const bodyTexts = {
    consultative: `Hi Team at ${businessName},

I was looking at local businesses in ${city} and came across ${websiteUrl}. I noticed the current site has great customer feedback, but the mobile layout is missing a sticky call button, and page load time is slightly delayed on phone connections.

We recently helped a similar local team upgrade their site with a modern mobile booking system, which increased their monthly lead inquiries by 45%.

Would you be open to a quick 5-minute look at a 1-page modern concept wireframe we put together for ${businessName}?

Best regards,
LeadVine Web Design Studio`,

    direct: `Hi ${businessName} Team,

Your current website (${websiteUrl}) appears to have been built several years ago. Key issues holding back conversions:
1. Missing SSL trust security badge
2. Outdated mobile navigation
3. No instant quote request form

We specialize in high-converting web redesigns for ${city} businesses. Would Thursday at 2 PM work for a brief 10-minute call to review our proposed redesign scope?`,

    video_teaser: `Hi there,

I recorded a quick 90-second screen audit pointing out 3 small UX tweaks for ${websiteUrl} that can instantly prevent prospective clients from bouncing to local competitors.

Reply "Send Video" and I'll send the link right over!`,

    wireframe_pitch: `Hi Team at ${businessName},

We generated a modern homepage redesign concept for ${websiteUrl} featuring a new color scheme, high-converting hero headline, and mobile online booking wizard.

You can preview the live wireframe directly in your LeadVine agency portal or let us know if you'd like us to customize it further for your brand.`,
  };

  return {
    id: `email-${Date.now()}`,
    leadName: businessName,
    subjectLine: subjectLines[tone],
    bodyText: bodyTexts[tone],
    tone,
    keyIssuesHighlighted: [
      "Slow mobile page load speed",
      "Missing sticky mobile phone action button",
      "Outdated copyright & layout structure",
    ],
    suggestedFollowUpDays: 3,
  };
}
