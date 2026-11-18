"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AgentUIMessage } from "@/lib/agent";
import { createAgentTransport } from "@/lib/agent-client";
import { profile, projects } from "@/content/profile";
import { BookingForm } from "./BookingForm";
import { Markdown } from "./Markdown";

const STORE_KEY = "mz-agent-thread-v1";

const SUGGESTIONS = [
  { q: "What has Murtaza shipped with AI agents?", hint: "Healthcare voice agent, chat agents, AI copy" },
  { q: "Which products does he own?", hint: "DM IQ and BrandOye" },
  { q: "What do clients say about working with him?", hint: "Founders in New York, Zurich, Dubai" },
  { q: "I'd like to book a call", hint: "Opens a short booking form" },
];

function loadThread(): AgentUIMessage[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as AgentUIMessage[]) : [];
  } catch {
    return [];
  }
}

function errorText(err: Error) {
  try {
    const parsed = JSON.parse(err.message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {}
  return "The agent didn't respond. Check your connection and try again.";
}

function ProjectMini({ slugs }: { slugs: string[] }) {
  const items = slugs.map((s) => projects.find((p) => p.slug === s)).filter(Boolean) as typeof projects;
  return (
    <div className="mini">
      {items.map((p) => (
        <a key={p.slug} href={`#project-${p.slug}`}>
          <div className="t">
            <b>{p.name}</b>
            <span className="k">{p.url ? p.urlLabel : p.privateNote ?? p.kind}</span>
          </div>
          <p>{p.oneLiner}</p>
        </a>
      ))}
    </div>
  );
}

function ContactCard() {
  const rows = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "LinkedIn", value: "zaidi-murtaza", href: profile.linkedin },
    { label: "GitHub", value: "zaidimurtaza", href: profile.github },
    { label: "Résumé", value: "PDF", href: profile.resume },
  ];
  return (
    <div className="contact-card">
      {rows.map((r) => (
        <a key={r.label} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
          {r.label}
          <span>{r.value}</span>
        </a>
      ))}
    </div>
  );
}

function BotMessage({ message, onClose }: { message: AgentUIMessage; onClose: () => void }) {
  return (
    <div className="msg-bot">
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return part.text ? <Markdown key={i} text={part.text} /> : null;
          case "tool-showProjects":
            return part.state === "output-available" ? (
              <div key={i} onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}>
                <ProjectMini slugs={part.output.slugs} />
              </div>
            ) : null;
          case "tool-openBookingForm":
            return part.state === "output-available" ? <BookingForm key={i} topic={part.output.topic} /> : null;
          case "tool-showContact":
            return part.state === "output-available" ? <ContactCard key={i} /> : null;
          default:
            return null;
        }
      })}
    </div>
  );
}

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="7" y="7" width="10" height="10" rx="2" />
  </svg>
);

export default function ChatPanel({
  open,
  onClose,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  pending: { text: string; nonce: number } | null;
}) {
  const [initial] = useState(loadThread);
  const [transport] = useState(() => createAgentTransport<AgentUIMessage>());
  const { messages, sendMessage, status, stop, error, regenerate, setMessages, clearError } = useChat<AgentUIMessage>({
    messages: initial,
    transport,
  });
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastNonce = useRef<number | null>(null);
  const busy = status === "submitted" || status === "streaming";

  // Persist the thread for this browser session.
  useEffect(() => {
    if (busy) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages, busy]);

  // Send a prompt handed over from the hero ask bar or a page button.
  useEffect(() => {
    if (!pending || pending.nonce === lastNonce.current) return;
    lastNonce.current = pending.nonce;
    if (pending.text.trim()) void sendMessage({ text: pending.text.trim() });
  }, [pending, sendMessage]);

  // Keep the newest content in view.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Focus management + Escape to close + simple focus trap.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    if (error) clearError();
    void sendMessage({ text: t });
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "";
  }

  function reset() {
    stop();
    setMessages([]);
    clearError();
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
    inputRef.current?.focus();
  }

  if (!open) return null;

  const lastIsUser = messages.at(-1)?.role === "user";

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div ref={dialogRef} className="panel" role="dialog" aria-modal="true" aria-labelledby="agent-title">
        <header className="panel-head">
          <Image src="/murtaza.jpg" alt="" width={36} height={36} />
          <div className="who">
            <b id="agent-title">Murtaza&apos;s agent</b>
            <span>
              <i className="status-dot" aria-hidden="true" />
              Answers from his portfolio and books calls
            </span>
          </div>
          {messages.length > 0 && (
            <button type="button" className="icon-btn" onClick={reset} aria-label="Start a new conversation" title="New conversation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          )}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div ref={threadRef} className="thread" aria-live="polite" aria-busy={busy}>
          {messages.length === 0 && (
            <div className="welcome">
              <h3>Ask anything about Murtaza&apos;s work.</h3>
              <p>
                Projects, stack, how he works, what clients say. When you&apos;re ready, the agent can set up a call.
              </p>
              <div className="suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s.q} type="button" onClick={() => send(s.q)}>
                    {s.q}
                    <span>{s.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="msg-user">
                {m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
              </div>
            ) : (
              <BotMessage key={m.id} message={m} onClose={onClose} />
            ),
          )}

          {status === "submitted" && lastIsUser && (
            <div className="typing" aria-label="The agent is writing">
              <i />
              <i />
              <i />
            </div>
          )}

          {error && (
            <div className="err" role="alert">
              <span>{errorText(error)}</span>
              <button type="button" onClick={() => regenerate()}>
                Try again
              </button>
            </div>
          )}
        </div>

        <div className="composer">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label htmlFor="agent-input" className="sr-only">
              Message Murtaza&apos;s agent
            </label>
            <textarea
              id="agent-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={2000}
              placeholder="Ask about projects, stack, or book a call"
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            {busy ? (
              <button type="button" className="send" onClick={() => stop()} aria-label="Stop the answer">
                <StopIcon />
              </button>
            ) : (
              <button type="submit" className="send" disabled={!input.trim()} aria-label="Send message">
                <SendIcon />
              </button>
            )}
          </form>
          <small>The agent answers from Murtaza&apos;s portfolio. For anything else, book a call.</small>
        </div>
      </div>
    </>
  );
}
