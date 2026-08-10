# LeadVine — Grape Leads-style MVP

A lead-generation SaaS for web/SEO agencies. Fresh, distinctive design (dark editorial with a warm vine/wine accent — not the reference's purple).

## Scope (v1)

**Public site**

- Landing (hero, 3 tools, how it works, pricing, FAQ, CTA)
- `/auth` (email + password, Google sign-in)

**App (authenticated)**

- `/app` dashboard — recent searches, quick stats, credit balance
- `/app/find-leads` — **Businesses without websites.** Enter business type + location → Google Places Text Search → filter results missing a `website` field → save to a "Lead List" with contact info (name, address, phone, maps URL, rating).
- `/app/audit-sites` — **Outdated sites / needs redesign.** Paste or upload a list of URLs → batch scrape via Firecrawl → detect signals (mobile viewport, HTTPS, page size, last-modified, presence of modern frameworks, screenshot) → score 0–100 and flag "needs redesign".
- `/app/seo-audit` — **SEO audit.** Enter a URL → Firecrawl scrape → extract title, meta description, H1s, canonical, OG tags, image alt coverage, internal/external link counts, word count → SEO score with actionable recommendations. Downloadable report (print-to-PDF).
- `/app/lists` — saved lead lists, export CSV.
- `/app/settings` — profile, API usage.

## Design direction

- Dark canvas `#0E0F0C` with warm off-white text.
- Accent: **vine green** `#B7E04B` + deep bordeaux `#5B0E1E` for secondary.
- Typography: **Fraunces** (display, semi-serif) + **Inter Tight** (UI).
- Grain texture overlay, thin hairline borders, generous whitespace.
- Editorial hero with oversized display type and a live "lead card" mock.
- No purple, no generic SaaS gradient.

## Tech

- **Lovable Cloud** for auth + Postgres (tables: `profiles`, `lead_lists`, `leads`, `audits`, `seo_reports`, `credits_ledger`).
- **RLS**: user_id-scoped on all data tables.
- **Firecrawl connector** for site scraping (website audits + SEO audits).
- **Google Places API** (New) — user-supplied secret `GOOGLE_PLACES_API_KEY`, called from a server function. Text Search + Place Details to get the `website` field.
- Server functions (`createServerFn` + `requireSupabaseAuth`) for all lookups; results persisted per user.
- CSV export client-side.

## Build order

1. Enable Lovable Cloud; migrations for tables + RLS.
2. Connect Firecrawl; request `GOOGLE_PLACES_API_KEY`.
3. Design system in `src/styles.css` + fonts.
4. Landing + auth (email/password + Google).
5. App shell + dashboard.
6. Find Leads flow (Places search → save list).
7. Site Audit flow (Firecrawl batch → score).
8. SEO Audit flow (Firecrawl → report).
9. Lists + CSV export + settings.

## Out of scope for v1

Billing/Stripe, team seats, scheduled re-audits, email outreach templates. Easy to add later.

Approve and I'll build it end-to-end.
