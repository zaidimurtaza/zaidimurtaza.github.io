"use client";

import { useState } from "react";
import { openAgent } from "./agent-events";

const CHIPS = [
  "What has he shipped with AI agents?",
  "Which products does he own?",
  "Book a call with Murtaza",
];

export function HeroAsk() {
  const [q, setQ] = useState("");
  return (
    <div id="hero-ask">
      <form
        className="askbar"
        onSubmit={(e) => {
          e.preventDefault();
          openAgent(q);
          setQ("");
        }}
      >
        <label htmlFor="hero-input" className="sr-only">
          Ask Murtaza&apos;s agent a question
        </label>
        <input
          id="hero-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask my agent anything"
          autoComplete="off"
        />
        <button className="send" type="submit" aria-label="Ask the agent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>
      <ul className="chips">
        {CHIPS.map((c) => (
          <li key={c}>
            <button type="button" className="chip" onClick={() => openAgent(c)}>
              {c}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AgentButton({
  prompt,
  children,
  className = "btn btn-primary",
}: {
  prompt?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={() => openAgent(prompt)}>
      {children}
    </button>
  );
}
