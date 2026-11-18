// Visual proof for the work section and the hero stack.

export type FlowStep = { label: string; note: string };

export const showcase: Record<string, { shot?: string; flow: FlowStep[] }> = {
  healos: {
    shot: "/work/healos.webp",
    flow: [
      { label: "Patient call or fax", note: "Voice STT and fax OCR" },
      { label: "Agent with tools", note: "Intake, availability search, notes" },
      { label: "EHR adapters", note: "Epic, Cerner, Cerbo behind one interface" },
      { label: "Postgres", note: "Idempotent writes across instances" },
    ],
  },
  dmiq: {
    shot: "/work/dmiq.webp",
    flow: [
      { label: "One upload", note: "Video transcribed by Deepgram" },
      { label: "AI copy per channel", note: "Groq, Gemini, Cerebras with failover" },
      { label: "Postgres schedule", note: "Reconciler claims jobs with SKIP LOCKED" },
      { label: "Channel adapters", note: "20 networks, per-channel locks" },
    ],
  },
  brandoye: {
    shot: "/work/brandoye.webp",
    flow: [
      { label: "Next.js workspace", note: "Web on Vercel, Expo mobile" },
      { label: "FastAPI", note: "Web and scheduler workers on a VPS" },
      { label: "Metered AI client", note: "Every call logged and charged to credits" },
      { label: "DM IQ Partner API", note: "Publishing to social channels" },
    ],
  },
  projectaal: {
    shot: "/work/projectaal.webp",
    flow: [
      { label: "Prompt", note: "Founder describes the app" },
      { label: "Metered chat function", note: "Model routing and credits" },
      { label: "WebContainer preview", note: "Runs the generated app in the browser" },
      { label: "Deploy and export", note: "Vercel deploy, GitHub push, own the code" },
    ],
  },
  neverft: {
    shot: "/work/neverft.webp",
    flow: [
      { label: "Group chat", note: "Discord or Slack" },
      { label: "RSVP parser", note: "Deterministic, before any model call" },
      { label: "Agent run", note: "Roster, teams, session, scores as tools" },
      { label: "Never FT session", note: "Link and results posted back to chat" },
    ],
  },
  "peak-agent": {
    flow: [
      { label: "Ad platforms", note: "OAuth to GA4 and LinkedIn Ads" },
      { label: "Fatigue signals", note: "Python AI backend" },
      { label: "LLM creatives", note: "Video variations generated" },
    ],
  },
  digistall: {
    shot: "/work/digistall.webp",
    flow: [
      { label: "Storefront", note: "React" },
      { label: "Express API", note: "MongoDB" },
      { label: "Rider app", note: "Live location and alerts" },
    ],
  },
  adops: {
    flow: [
      { label: "3 ad servers", note: "Hourly and nightly pulls" },
      { label: "Normalise", note: "One metric definition" },
      { label: "ClickHouse", note: "One dashboard" },
    ],
  },
  proceedit: {
    flow: [
      { label: "Fintech clients", note: "GraphQL and REST" },
      { label: "Flask services", note: "Messaging engine" },
      { label: "Postgres", note: "Designed schema" },
    ],
  },
};

// Layers of the hero stack, top to bottom, and where each shows up in the work.
export const layers = [
  { id: "interface", name: "Interface", tech: "Next.js, React, Expo", used: ["brandoye", "dmiq", "projectaal", "healos"] },
  { id: "agents", name: "AI agents", tech: "Tool calling, voice, model failover", used: ["healos", "neverft", "dmiq", "peak-agent"] },
  { id: "api", name: "APIs", tech: "FastAPI, Hono, GraphQL, Express", used: ["brandoye", "healos", "proceedit", "digistall"] },
  { id: "jobs", name: "Jobs and queues", tech: "Schedulers, retries, idempotency", used: ["dmiq", "brandoye", "adops"] },
  { id: "data", name: "Data", tech: "Postgres, ClickHouse, MongoDB", used: ["dmiq", "healos", "adops", "peak-agent"] },
  { id: "infra", name: "Infrastructure", tech: "Docker, nginx, VPS, Vercel", used: ["brandoye", "neverft", "projectaal"] },
] as const;

export const shippedFor = [
  "Attack Capital (YC)",
  "HealOS",
  "Peak Agent AI",
  "proceedit",
  "North of Zero",
  "ProjectAAL",
  "Digistall",
];
