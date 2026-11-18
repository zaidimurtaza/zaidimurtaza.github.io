"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AGENT_OPEN } from "./agent-events";

// The chat runtime (AI SDK + UI) loads only when someone opens the agent.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

export default function AgentChat() {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<{ text: string; nonce: number } | null>(null);
  const [heroAskVisible, setHeroAskVisible] = useState(true);
  const [draft, setDraft] = useState("");

  const openWith = useCallback((text: string) => {
    setLoaded(true);
    setOpen(true);
    if (text.trim()) setPending({ text, nonce: Date.now() });
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => openWith((e as CustomEvent<{ prompt?: string }>).detail?.prompt ?? "");
    window.addEventListener(AGENT_OPEN, onOpen);
    return () => window.removeEventListener(AGENT_OPEN, onOpen);
  }, [openWith]);

  // The dock stays hidden while the hero's own ask bar is on screen.
  useEffect(() => {
    const el = document.getElementById("hero-ask");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setHeroAskVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Warm the chat bundle when the browser is idle, so the first open is instant.
  useEffect(() => {
    const warm = () => void import("./ChatPanel");
    const id = window.requestIdleCallback ? window.requestIdleCallback(warm, { timeout: 4000 }) : window.setTimeout(warm, 3000);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div className="dock" data-hidden={heroAskVisible || open}>
        <form
          className="askbar"
          onSubmit={(e) => {
            e.preventDefault();
            openWith(draft);
            setDraft("");
          }}
        >
          <Image className="dock-avatar" src="/murtaza.jpg" alt="" width={28} height={28} />
          <label htmlFor="dock-input" className="sr-only">
            Ask Murtaza&apos;s agent
          </label>
          <input
            id="dock-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setLoaded(true)}
            placeholder="Ask Murtaza's agent, or book a call"
            autoComplete="off"
            tabIndex={heroAskVisible || open ? -1 : 0}
          />
          <button className="send" type="submit" aria-label="Open the agent" tabIndex={heroAskVisible || open ? -1 : 0}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </div>
      {loaded && <ChatPanel open={open} onClose={close} pending={pending} />}
    </>
  );
}
