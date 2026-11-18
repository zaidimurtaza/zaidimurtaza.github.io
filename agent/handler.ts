/*
  Murtaza's portfolio agent. Platform-neutral fetch handler, bundled by scripts/build-agent.mjs
  and served by the Supabase Edge Function in supabase/functions/agent. Keeps the Gemini key
  off the static GitHub Pages site. Routes (relative to the function URL):
    POST .../chat  → streamed AI SDK UI messages (Gemini, with project/contact/booking tools)
    POST .../book  → "send a message" fallback (Resend email or webhook)
    GET  ...       → health check
*/
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { agentTools, buildInstructions, type AgentUIMessage } from "../src/lib/agent";
import { bookingSchema, deliverBooking, type BookingEnv } from "../src/lib/booking";
import { offlineStreamResponse, writeOfflineReply } from "../src/lib/offline-stream";
import { clientKey, rateLimit } from "../src/lib/rate-limit";
import { profile } from "../src/content/profile";

type Env = BookingEnv & {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  ALLOWED_ORIGINS?: string;
};

const DEFAULT_ORIGINS = "https://zaidimurtaza.github.io,http://localhost:3000";

function cors(req: Request, env: Env): Record<string, string> | null {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ORIGINS).split(",").map((s) => s.trim());
  if (!allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  Response.json(body, { status, headers });

async function chat(req: Request, env: Env, headers: Record<string, string>) {
  const limit = rateLimit(`chat:${clientKey(req)}`, 20, 60_000);
  if (!limit.ok) return json({ error: `You're sending messages quickly. Try again in ${limit.retryAfter} seconds.` }, 429, headers);

  let messages: AgentUIMessage[];
  try {
    ({ messages } = (await req.json()) as { messages: AgentUIMessage[] });
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("empty");
  } catch {
    return json({ error: "Send at least one message." }, 400, headers);
  }

  messages = messages.slice(-16).map((m) =>
    m.role === "user"
      ? { ...m, parts: m.parts.map((p) => (p.type === "text" ? { ...p, text: p.text.slice(0, 2000) } : p)) }
      : m,
  );

  if (!env.GEMINI_API_KEY) return offlineStreamResponse(messages, headers);

  const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
  // Give Gemini a time budget; if it errors, hangs or returns nothing, answer with the offline responder.
  const timeout = AbortSignal.timeout(25_000);
  const signal = AbortSignal.any([req.signal, timeout]);
  const modelMessages = await convertToModelMessages(messages);

  const stream = createUIMessageStream<AgentUIMessage>({
    async execute({ writer }) {
      writer.write({ type: "start" });
      let failed = false;
      let wroteText = false;
      try {
        const result = streamText({
          model: google(env.GEMINI_MODEL || "gemini-3.5-flash-lite"),
          instructions: buildInstructions(),
          messages: modelMessages,
          tools: agentTools,
          stopWhen: isStepCount(4),
          maxOutputTokens: 700,
          abortSignal: signal,
          onError: () => {}, // logged once below; the visitor gets the offline answer instead
        });
        const ui = toUIMessageStream({
          stream: result.stream,
          sendStart: false,
          sendFinish: false,
          onError: (error) => {
            failed = true;
            console.error("[chat] Gemini error, using offline answer:", (error as Error)?.message ?? error);
            return "";
          },
        });
        const reader = ui.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.type === "error") {
            failed = true;
            break;
          }
          if (value.type === "text-delta" && value.delta.trim()) wroteText = true;
          if (value.type.startsWith("tool-")) wroteText = true;
          writer.write(value as Parameters<typeof writer.write>[0]);
        }
      } catch (error) {
        if (req.signal.aborted) return; // visitor pressed stop
        failed = true;
        console.error("[chat] Gemini call failed, using offline answer:", (error as Error)?.message ?? error);
      }
      if (failed || !wroteText) {
        await writeOfflineReply(writer, messages, wroteText ? "\n\n" : "");
      }
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ headers, stream });
}

async function book(req: Request, env: Env, headers: Record<string, string>) {
  const limit = rateLimit(`book:${clientKey(req)}`, 4, 10 * 60_000);
  if (!limit.ok) return json({ ok: false, error: `Too many requests. Try again in ${limit.retryAfter} seconds.` }, 429, headers);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Send the form as JSON." }, 400, headers);
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return json({ ok: false, error: "Check the highlighted fields.", fieldErrors }, 422, headers);
  }
  if (parsed.data.website) return json({ ok: true }, 200, headers); // honeypot

  const result = await deliverBooking(parsed.data, env);
  if (result.ok) return json({ ok: true }, 200, headers);

  const subject = encodeURIComponent(`Call request from ${parsed.data.name}`);
  const mailBody = encodeURIComponent(parsed.data.topic);
  return json(
    {
      ok: false,
      error: "The message did not go through. Send it by email instead.",
      mailto: `mailto:${profile.email}?subject=${subject}&body=${mailBody}`,
    },
    503,
    headers,
  );
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const headers = cors(req, env);

    const path = url.pathname.replace(/\/+$/, "");

    if (req.method === "GET" && !path.endsWith("/chat") && !path.endsWith("/book")) {
      return Response.json({ ok: true, service: "murtaza-portfolio-agent", model: env.GEMINI_API_KEY ? "gemini" : "offline" });
    }
    if (!headers) return new Response("Origin not allowed", { status: 403 });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (req.method !== "POST") return json({ error: "Use POST." }, 405, headers);

    if (path.endsWith("/chat")) return chat(req, env, headers);
    if (path.endsWith("/book")) return book(req, env, headers);
    return json({ error: "Not found" }, 404, headers);
  },
};
