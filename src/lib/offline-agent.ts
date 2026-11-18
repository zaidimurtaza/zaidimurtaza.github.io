// Deterministic responder used when no model key is configured (or the model call fails).
// It keeps the chat useful: answers from the same profile data and drives the same tool UIs.
import { capabilities, experience, profile, projects, testimonials } from "../content/profile";

export type OfflineReply = {
  text: string;
  tool?:
    | { name: "showProjects"; input: { slugs: string[] }; output: { slugs: string[] } }
    | { name: "openBookingForm"; input: { topic?: string }; output: { topic: string } }
    | { name: "showContact"; input: Record<string, never>; output: Record<string, string> };
};

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

function matchProjects(q: string) {
  const hits = projects.filter((p) =>
    [p.slug, p.name, p.org ?? "", ...p.stack].some((k) => k && q.includes(k.toLowerCase().split(" ")[0])),
  );
  return hits.slice(0, 4);
}

export function offlineReply(raw: string): OfflineReply {
  const q = raw.toLowerCase();

  if (has(q, ["book", "schedule", "call", "meet", "hire", "talk", "available", "availability", "work with", "quote", "rate", "price"])) {
    // Prefill the topic only when the message says more than "book a call".
    const STOP = new Set(["i", "id", "would", "like", "want", "to", "book", "schedule", "a", "an", "call", "meeting", "meet", "with", "murtaza", "please", "can", "we", "talk", "hire", "him"]);
    const rest = q.replace(/[^a-z0-9 ]+/g, " ").split(" ").filter((w) => w && !STOP.has(w)).join(" ");
    const topic = rest.length > 12 ? raw.trim().slice(0, 300) : "";
    return {
      text: `${profile.availability} Pick a 15-minute slot below, it books straight into his calendar.`,
      tool: { name: "openBookingForm", input: { topic }, output: { topic } },
    };
  }

  if (has(q, ["contact", "email", "linkedin", "github", "resume", "résumé", "cv"])) {
    return {
      text: "Here's how to reach Murtaza directly.",
      tool: {
        name: "showContact",
        input: {},
        output: { email: profile.email, linkedin: profile.linkedin, github: profile.github, resume: profile.resume },
      },
    };
  }

  if (has(q, ["testimonial", "review", "say about", "feedback", "reference", "clients say", "trust"])) {
    const quoted = testimonials.filter((t) => t.quote);
    return {
      text:
        quoted.map((t) => `**${t.name}**, ${t.role}: "${t.quote}"`).join("\n\n") +
        `\n\nHe has also worked closely with ${testimonials
          .filter((t) => !t.quote)
          .map((t) => `${t.name} (${t.role})`)
          .join(", ")}.`,
    };
  }

  const named = matchProjects(q);
  if (named.length && !has(q, ["experience", "career"])) {
    const p = named[0];
    return {
      text: `**${p.name}**: ${p.oneLiner} ${p.problem}${p.metrics ? `\n\nResults: ${p.metrics.join("; ")}.` : ""}`,
      tool: { name: "showProjects", input: { slugs: named.map((n) => n.slug) }, output: { slugs: named.map((n) => n.slug) } },
    };
  }

  if (has(q, ["health", "ehr", "voice", "medical", "agent", "ai", "llm"])) {
    const s = ["healos", "neverft", "dmiq"];
    return {
      text: `${capabilities[0].body} In production: a healthcare voice and notes agent at HealOS (600+ weekly users), a chat agent for football groups on Discord and Slack, and multi-provider AI copy in DM IQ.`,
      tool: { name: "showProjects", input: { slugs: s }, output: { slugs: s } },
    };
  }

  if (has(q, ["saas", "founder", "product", "startup", "own"])) {
    const s = ["dmiq", "brandoye", "projectaal"];
    return {
      text: "Murtaza founded DM IQ, co-founded BrandOye, and built ProjectAAL from prototype to production for a client. Each one has auth, billing, credits and real users.",
      tool: { name: "showProjects", input: { slugs: s }, output: { slugs: s } },
    };
  }

  if (has(q, ["experience", "career", "background", "years", "worked", "job"])) {
    return {
      text: experience.map((e) => `- **${e.title}**, ${e.org} (${e.period})`).join("\n"),
    };
  }

  if (has(q, ["stack", "tech", "skill", "language", "framework"])) {
    return {
      text: capabilities.map((c) => `- **${c.title}**: ${c.tools.join(", ")}`).join("\n"),
    };
  }

  return {
    text: `${profile.summary}\n\nAsk about a project, his AI work, what clients say, or book a call.`,
  };
}
