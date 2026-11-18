"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { offlineStreamResponse } from "./offline-stream";

// URL of the Cloudflare Worker that holds the Gemini key. Baked in at build time.
export const AGENT_URL = (process.env.NEXT_PUBLIC_AGENT_URL ?? "").replace(/\/$/, "");

// Talk to the Worker; if it is missing, down or erroring (not rate limiting), answer offline in the browser.
export function createAgentTransport<M extends UIMessage>() {
  return new DefaultChatTransport<M>({
    api: AGENT_URL ? `${AGENT_URL}/chat` : "/agent-offline",
    fetch: async (input, init) => {
      const messages = () => {
        try {
          return (JSON.parse(String(init?.body ?? "{}")) as { messages?: UIMessage[] }).messages ?? [];
        } catch {
          return [];
        }
      };
      if (!AGENT_URL) return offlineStreamResponse(messages());
      try {
        const res = await fetch(input, init);
        if (res.ok || res.status === 429 || res.status === 400) return res;
        return offlineStreamResponse(messages());
      } catch (err) {
        if ((err as Error)?.name === "AbortError") throw err;
        return offlineStreamResponse(messages());
      }
    },
  });
}
