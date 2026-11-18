// Single source of truth for everything the site and the chat agent say about Murtaza.
// Edit here; the page, the agent's system prompt and the offline responder all read from it.

export const profile = {
  name: "Murtaza Zaidi",
  role: "Full-stack AI engineer and founder",
  location: "India, working remotely with teams in New York, Zurich, Stockholm, Barcelona and Dubai",
  email: "zaidimurtaza102@gmail.com",
  linkedin: "https://www.linkedin.com/in/zaidi-murtaza/",
  github: "https://github.com/zaidimurtaza",
  resume: "/murtaza-zaidi-resume.pdf",
  cal: "https://cal.com/murtaza-zaidi-9kmnhb/15min",
  site: "https://zaidimurtaza.github.io",
  summary:
    "I build AI products end to end, from the database schema to the agent's tool calls to the deploy. I have shipped for a YC-backed healthtech team in New York and an AdTech startup in Zurich and Stockholm, and I run my own products, DM IQ and BrandOye.",
  availability:
    "Taking on a small number of freelance builds and fractional engineering roles. Usual first step is a 15-minute call.",
};

export type Project = {
  slug: string;
  name: string;
  kind: "Founder" | "Co-founder" | "Engineer" | "Client build";
  org?: string;
  url?: string;
  urlLabel?: string;
  extraLinks?: { label: string; url: string }[];
  oneLiner: string;
  problem: string;
  stack: string[];
  architecture: string;
  metrics?: string[];
  featured?: boolean;
  privateNote?: string;
};

export const projects: Project[] = [
  {
    slug: "healos",
    name: "HealOS",
    kind: "Engineer",
    org: "Attack Capital, YC-backed, New York",
    url: "https://healos.ai",
    urlLabel: "healos.ai",
    oneLiner: "AI agents for clinical notes, patient intake and fax in US healthcare practices.",
    problem:
      "Clinics lose hours to documentation, phone intake and faxed referrals. HealOS agents edit SOAP notes section by section, answer appointment calls and read faxes so staff can see patients instead.",
    stack: ["Next.js", "Hono", "PostgreSQL", "Voice and STT", "LLM tool calling", "OCR", "Epic, Cerner, Cerbo EHR"],
    architecture:
      "A voice agent built on an adapter pattern, so each EHR plugs in behind one interface. Tool calls handle intake and availability search. Writes across multiple Postgres instances carry idempotency keys so retries never double-book.",
    metrics: ["600+ weekly active users", "3% dissatisfaction rate", "30,000+ agent chat sessions"],
    featured: true,
  },
  {
    slug: "dmiq",
    name: "DM IQ",
    kind: "Founder",
    url: "https://dmiq.site",
    urlLabel: "dmiq.site",
    extraLinks: [{ label: "Caption Studio, subcap.dmiq.site", url: "https://subcap.dmiq.site" }],
    oneLiner: "Instagram comment-to-DM automation with AI lead qualification and multi-channel scheduling.",
    problem:
      "Comments and story replies are leads that go cold within hours. DM IQ answers them in DMs, qualifies the lead with AI, hands it to a CRM and schedules posts to every channel from one upload.",
    stack: ["Next.js", "Supabase Postgres", "FastAPI", "Procrastinate queue", "Cloudflare R2", "Groq, Gemini, Cerebras", "Deepgram", "Razorpay"],
    architecture:
      "The app writes schedules to Postgres. A Python reconciler claims due jobs with FOR UPDATE SKIP LOCKED and a per-channel lock, then hands each to a platform adapter. Copy generation fails over across three model providers with forced tool calls and a repair loop. A Partner API lets other products publish through it.",
    metrics: ["20 publishing channels", "600 simultaneous jobs, zero double posts in load tests"],
    featured: true,
  },
  {
    slug: "brandoye",
    name: "BrandOye",
    kind: "Co-founder",
    url: "https://brandoye.com",
    urlLabel: "brandoye.com",
    oneLiner: "An AI CMO: SEO, social content, scheduling and a weekly plan that learns from results.",
    problem:
      "Small teams juggle a writing tool, a scheduler, an SEO suite and an analytics dashboard. BrandOye plans, writes, publishes and measures marketing from one workspace.",
    stack: ["Next.js 16", "FastAPI", "PostgreSQL 16", "SQLAlchemy and Alembic", "OpenRouter", "Stripe", "DataForSEO", "Google and Meta Ads APIs", "Expo"],
    architecture:
      "Next.js on Vercel; FastAPI and Postgres on a VPS behind Cloudflare, with separate web and scheduler workers. Every model call goes through one metered client that logs usage and checks credits. Social publishing runs through DM IQ's Partner API.",
    metrics: ["Web and mobile apps", "Every AI call metered against credits"],
    featured: true,
  },
  {
    slug: "projectaal",
    name: "ProjectAAL",
    kind: "Client build",
    org: "for Bilal Junaid, Dubai",
    url: "https://projectaal.com",
    urlLabel: "projectaal.com",
    oneLiner: "An AI app builder that takes founders from a prompt to a deployed app they own.",
    problem:
      "Non-technical founders get stuck between a prototype and a real product. ProjectAAL generates the app, previews it in the browser, and deploys it with auth, a database and exportable code.",
    stack: ["React", "Vite", "Supabase Edge Functions", "WebContainers", "Monaco", "Yjs", "Stripe", "Vercel"],
    architecture:
      "A React app on roughly 100 Supabase Edge Functions. Every model call goes through one metered chat function that charges credits. Generated apps run in in-browser WebContainers, then deploy to Vercel with readiness polling.",
    metrics: ["~100 edge functions", "Prototype to production"],
  },
  {
    slug: "neverft",
    name: "Never FT agent",
    kind: "Client build",
    org: "for Jimmy Zamani, North of Zero",
    url: "https://neverft.com",
    urlLabel: "neverft.com",
    oneLiner: "An agent that lives in football group chats and turns RSVPs into real games.",
    problem:
      "Casual football groups organise in Discord and Slack with “In” and “+1”, so the app never sees the game. The agent reads the chat, confirms the roster with the host, makes teams, creates the session and posts results.",
    stack: ["Python", "Pydantic AI", "OpenRouter", "discord.py", "Slack Bolt", "PostgreSQL", "Docker", "nginx"],
    architecture:
      "One platform-agnostic agent core with thin Discord and Slack adapters. Deterministic RSVP parsing runs before a single tool-calling model run, and the host confirms before anything is created. Login and in-Discord payments included.",
    metrics: ["2 chat platforms live", "317 automated tests"],
  },
  {
    slug: "peak-agent",
    name: "Peak Agent AI",
    kind: "Engineer",
    org: "AdTech, Zurich and Stockholm",
    oneLiner: "An AdTech platform taken from 0 to 1: AI backend, creatives and ad-platform tracking.",
    problem:
      "Ad teams run creatives until performance collapses and cannot see why. I built LLM-generated video creatives driven by ad-fatigue signals, plus GA4 and LinkedIn Ads tracking.",
    stack: ["Python", "Next.js", "PostgreSQL", "OAuth 2.0", "GA4", "LinkedIn Ads API", "LLMs"],
    architecture:
      "A Python AI backend with Next.js server components. A job logs monitor gives real-time alerts and per-job restart. Postgres triggers and indexes keep audit fields correct and queries fast; magic-link impersonation lets admins support users safely.",
    metrics: ["40% less debugging time", "60% faster queries", "50% faster creative production"],
    privateNote: "Private platform",
  },
  {
    slug: "digistall",
    name: "Digistall",
    kind: "Client build",
    org: "for Siyag Rural Market",
    url: "https://digistall.in",
    urlLabel: "digistall.in",
    oneLiner: "E-commerce for rural India, with AI captions, bulk import and a rider tracker.",
    problem:
      "Small rural sellers need a storefront and delivery that works without a tech team. Digistall gives them AI product captions, bulk catalogue import and live rider tracking with alerts.",
    stack: ["Node.js", "Express", "MongoDB", "React", "Chrome extension"],
    architecture:
      "Express APIs over MongoDB behind React storefront and admin apps. The admin dashboard has role-based access and order management; the rider app streams location for real-time delivery alerts.",
    metrics: ["35% faster API responses", "25% better delivery accuracy"],
  },
  {
    slug: "adops",
    name: "Ad-ops reporting hub",
    kind: "Client build",
    org: "for a programmatic media network in Asia",
    oneLiner: "One dashboard for three ad servers, refreshed every hour.",
    problem:
      "The team checked three ad-server dashboards with three sets of metrics. Partner, geo and bundle performance now sit in one place with consistent definitions.",
    stack: ["Python", "ClickHouse", "PostgreSQL", "Docker Compose"],
    architecture:
      "Python connectors pull each server's reports hourly and nightly, normalise the fields and load them into ClickHouse. Postgres holds app tables, data-quality checks and backfill state.",
    privateNote: "Private client tool",
  },
  {
    slug: "proceedit",
    name: "Fintech messaging engine",
    kind: "Client build",
    org: "for proceedit, Barcelona",
    oneLiner: "A Python messaging engine with GraphQL APIs for a fintech trading platform.",
    problem:
      "A trading platform needed reliable messaging and data APIs it could put in front of fintech customers.",
    stack: ["Python", "Flask", "GraphQL", "PostgreSQL"],
    architecture:
      "Flask services exposing GraphQL and REST over a designed Postgres schema, shipped through reviewed Git branches.",
    metrics: ["45% faster data retrieval"],
    privateNote: "Private platform",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  place: string;
  photo: string;
  quote?: string; // only when the person said it in these words
  valued: string; // Murtaza's summary of what they valued
  delivered: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Janluca Maris",
    role: "Business Director, proceedit",
    place: "Barcelona",
    photo: "/people/janluca-maris.jpg",
    quote: "Nice work on the messaging. It has been delivered, and they are serving production-ready fintech platforms.",
    valued: "Messaging that went straight into production for fintech customers.",
    delivered: "A Python messaging engine with GraphQL APIs for a fintech trading platform.",
  },
  {
    name: "Jimmy Zamani",
    role: "Founder, North of Zero",
    place: "Never FT",
    photo: "/people/jimmy-zamani.jpg",
    quote: "Very great work, Murtaza. You are a great person with great engineering logic and understanding.",
    valued: "Engineering logic and clear understanding of the product.",
    delivered: "Discord and Slack agents with workflows, admin support, login and in-Discord payments.",
  },
  {
    name: "Kaushik",
    role: "Co-founder, Attack Capital (YC-backed)",
    place: "New York",
    photo: "/people/kaushik.jpg",
    valued: "Saw the agent serve 400+ users a week across 30,000+ chat sessions.",
    delivered: "A production AI receptionist and clinical notes editor, plus multiple EHR integrations.",
  },
  {
    name: "Wicky Sri",
    role: "Co-founder, Peak Agent AI",
    place: "Zurich",
    photo: "/people/wicky-sri.jpg",
    valued: "The product, feature and improvement ideas brought in beyond the engineering.",
    delivered: "Took the product from 0 to 1 with full-stack, AI agents, databases and production deployment.",
  },
  {
    name: "Per Wicklund",
    role: "Co-founder, Peak Agent AI",
    place: "Stockholm",
    photo: "/people/per-wicklund.jpg",
    valued: "Product thinking and engineering in one person.",
    delivered: "From idea to shipped feature, without a hand-off between product and engineering.",
  },
  {
    name: "Bilal Junaid",
    role: "ERP Project Manager, Oracle",
    place: "Dubai",
    photo: "/people/bilal-junaid.jpg",
    valued: "A founder's mindset and builds that are production-ready.",
    delivered: "A production agentic AI system and a prototype turned into projectaal.com.",
  },
  {
    name: "Jitendar Singh Siyag",
    role: "Founder, Digistall",
    place: "Rajasthan",
    photo: "/people/jitendar-siyag.jpg",
    valued: "The AI features and end-to-end product development.",
    delivered: "A live e-commerce platform with AI captions, bulk import and a rider tracker with real-time alerts.",
  },
];

export const experience = [
  {
    period: "May 2026 – now",
    title: "Full Stack AI Engineer",
    org: "HealOS at Attack Capital (YC)",
    place: "New York, remote",
    points: [
      "AI agent that edits SOAP notes in chunks and runs medical-code search",
      "EHR integrations with Epic, Cerner and Cerbo; voice agent for intake and scheduling; fax OCR",
      "Next.js, Hono and PostgreSQL with idempotent multi-instance writes",
    ],
  },
  {
    period: "May 2025 – May 2026",
    title: "Full Stack Developer",
    org: "Peak Agent AI",
    place: "Sweden and Switzerland, remote",
    points: [
      "Owned the Python AI backend and Next.js app for an AdTech platform",
      "Job logs monitor with alerts and restart, cutting debugging time by 40%",
      "OAuth, GA4 and LinkedIn Ads tracking with LLM-generated video creatives",
    ],
  },
  {
    period: "Feb 2025 – May 2025",
    title: "Product Developer",
    org: "Digistall",
    place: "India, remote",
    points: ["Node, Express, MongoDB and React apps for Digistall, Gotan and Rider", "Admin dashboard with RBAC and live rider tracking"],
  },
  {
    period: "Jan 2025 – May 2025",
    title: "Backend Developer",
    org: "proceedit",
    place: "Barcelona, remote",
    points: ["Flask and GraphQL APIs with schema design, 45% faster data retrieval"],
  },
];

export const capabilities = [
  {
    title: "AI agents that do real work",
    body: "Tool-calling agents, voice and speech-to-text, retrieval, OCR and model failover. Built to be measured in sessions served, not demos.",
    tools: ["AI SDK", "Pydantic AI", "OpenRouter", "Anthropic, OpenAI, Gemini, Groq", "Deepgram"],
  },
  {
    title: "Full-stack SaaS, launch to billing",
    body: "Auth, multi-tenant data, payments, credits, admin tools and the marketing site. One person who can hold the whole product in their head.",
    tools: ["Next.js", "React", "Hono", "FastAPI", "Stripe", "Razorpay", "Supabase"],
  },
  {
    title: "Data and back-end systems that stay up",
    body: "Postgres schemas, queues, schedulers, idempotency and integrations with the APIs nobody enjoys: EHRs, ad platforms, social networks.",
    tools: ["PostgreSQL", "ClickHouse", "MongoDB", "Docker", "nginx", "VPS and Vercel"],
  },
];

export const stats = [
  { value: "600+", label: "weekly active users on HealOS" },
  { value: "30k+", label: "agent chat sessions served" },
  { value: "20", label: "publishing channels wired into DM IQ" },
  { value: "5", label: "countries shipped for" },
];
