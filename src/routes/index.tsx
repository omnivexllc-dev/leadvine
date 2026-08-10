import { createFileRoute, Link } from "@tanstack/react-router";
import { Grape, Search, Gauge, LineChart, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadVine — Find businesses that need a website" },
      {
        name: "description",
        content:
          "Lead-finding tools for web design and SEO agencies. Discover businesses without websites, audit outdated sites, and generate SEO reports in seconds.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <Hero />
      <Tools />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Grape className="h-6 w-6 text-vine" />
          <span className="font-display text-xl">LeadVine</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#tools" className="hover:text-foreground transition-colors">
            Tools
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            to="/auth"
            className="text-sm bg-vine text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-32 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-vine mb-6">
            <span className="h-px w-8 bg-vine" /> Lead tools for agencies
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mb-6">
            Find businesses <span className="italic text-vine">without websites.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8">
            Thousands of small businesses still don't have a site. LeadVine hands you a warm list
            every morning — plus batch audits and SEO reports to close them.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-vine text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90"
            >
              Start finding leads <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-md font-medium hover:bg-secondary"
            >
              See the tools
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-vine" /> No credit card
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-vine" /> Cancel anytime
            </div>
          </div>
        </div>

        <LeadCardMock />
      </div>
    </section>
  );
}

function LeadCardMock() {
  const leads = [
    {
      name: "Riverside Auto Body",
      type: "Auto repair · Portland, OR",
      phone: "(503) 555-0142",
      tag: "No website",
    },
    {
      name: "La Bonne Boulangerie",
      type: "Bakery · Montréal, QC",
      phone: "(514) 555-0198",
      tag: "No website",
    },
    {
      name: "Ash & Iron Barbershop",
      type: "Barber · Austin, TX",
      phone: "(512) 555-0177",
      tag: "No website",
    },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-vine/10 via-transparent to-bordeaux/20 blur-3xl" />
      <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Fresh leads · Portland
          </div>
          <div className="text-xs text-vine">● Live</div>
        </div>
        <div className="space-y-3">
          {leads.map((l, i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-4 flex items-center justify-between hover:border-vine/60 transition-colors"
            >
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.type}</div>
                <div className="text-xs text-muted-foreground mt-1">{l.phone}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-vine/15 text-vine px-2 py-1 rounded-full">
                {l.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tools() {
  const tools = [
    {
      icon: Search,
      title: "Businesses without websites",
      desc: "Our premier tool. We scan Google Maps for businesses missing a site — you get name, phone, address, and Maps link.",
    },
    {
      icon: Gauge,
      title: "Outdated site detector",
      desc: "Paste a list of URLs and get a redesign-need score based on mobile viewport, HTTPS, page weight, and modern-framework signals.",
    },
    {
      icon: LineChart,
      title: "SEO audit reports",
      desc: "One-click audits: title, meta, headings, canonical, OG, alt coverage, and prioritized recommendations to pitch clients.",
    },
  ];
  return (
    <section id="tools" className="px-6 py-24 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-widest text-vine mb-3">What we do</div>
          <h2 className="font-display text-4xl md:text-5xl">Three tools. One vine.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-border p-6 bg-card hover:border-vine/50 transition-colors"
            >
              <t.icon className="h-8 w-8 text-vine mb-4" />
              <h3 className="font-display text-2xl mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Pick a niche and city",
      d: "Auto repair in Portland. Bakeries in Montreal. You choose.",
    },
    {
      n: "02",
      t: "We scour Google Maps",
      d: "LeadVine filters for businesses missing a `website` field.",
    },
    {
      n: "03",
      t: "Export and pitch",
      d: "Save to a lead list, export CSV, and start reaching out.",
    },
  ];
  return (
    <section id="how" className="px-6 py-24 border-t border-border/50 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-vine mb-3">How it works</div>
        <h2 className="font-display text-4xl md:text-5xl mb-16">From search to signed contract.</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="font-display text-6xl text-vine/40 mb-4">{s.n}</div>
              <div className="font-display text-2xl mb-2">{s.t}</div>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Sprout",
      price: "Free",
      features: ["25 lead searches / mo", "10 site audits / mo", "5 SEO reports / mo"],
      cta: "Start free",
    },
    {
      name: "Vine",
      price: "$29",
      suffix: "/mo",
      features: ["500 lead searches", "300 site audits", "200 SEO reports", "CSV export"],
      cta: "Go Vine",
      featured: true,
    },
    {
      name: "Harvest",
      price: "$99",
      suffix: "/mo",
      features: [
        "Unlimited searches",
        "Unlimited audits",
        "White-label reports",
        "Priority support",
      ],
      cta: "Go Harvest",
    },
  ];
  return (
    <section id="pricing" className="px-6 py-24 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-vine mb-3">Pricing</div>
        <h2 className="font-display text-4xl md:text-5xl mb-16">Priced for growing agencies.</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-8 ${
                p.featured ? "border-vine bg-vine/5" : "border-border bg-card"
              }`}
            >
              <div className="font-display text-2xl mb-1">{p.name}</div>
              <div className="mb-6">
                <span className="font-display text-5xl">{p.price}</span>
                {p.suffix && <span className="text-muted-foreground text-sm">{p.suffix}</span>}
              </div>
              <ul className="space-y-2 mb-8 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-vine" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`block text-center py-3 rounded-md font-medium ${
                  p.featured
                    ? "bg-vine text-primary-foreground"
                    : "border border-border hover:bg-secondary"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Where do the leads come from?",
      a: "We query Google Maps (Places API) for businesses in your chosen niche and city, then filter for those without a website field.",
    },
    {
      q: "Can I export leads?",
      a: "Yes — every saved list can be downloaded as CSV, ready for your CRM or outreach tool.",
    },
    {
      q: "Do I need my own API keys?",
      a: "Only if you want to bring your own Google Places quota. Otherwise, LeadVine uses our shared quota with monthly caps per plan.",
    },
    {
      q: "Is there a free trial?",
      a: "The Sprout plan is free forever with a monthly quota, so you can validate leads before upgrading.",
    },
  ];
  return (
    <section id="faq" className="px-6 py-24 border-t border-border/50 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-vine mb-3">FAQ</div>
        <h2 className="font-display text-4xl md:text-5xl mb-12">Common questions.</h2>
        <div className="divide-y divide-border">
          {items.map((i) => (
            <details key={i.q} className="group py-6">
              <summary className="cursor-pointer font-display text-xl flex items-center justify-between">
                {i.q}
                <span className="text-vine text-2xl group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{i.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-32 border-t border-border/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-5xl md:text-6xl mb-6">
          Your next client <span className="italic text-vine">doesn't have a website yet.</span>
        </h2>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-vine text-primary-foreground px-8 py-4 rounded-md font-medium text-lg hover:opacity-90"
        >
          Find them <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Grape className="h-4 w-4 text-vine" />
          <span>© {new Date().getFullYear()} LeadVine</span>
        </div>
        <div className="flex gap-6">
          <a href="#tools" className="hover:text-foreground">
            Tools
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <Link to="/auth" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
