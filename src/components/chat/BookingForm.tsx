"use client";

import { useId, useState } from "react";
import { profile } from "@/content/profile";
import { AGENT_URL } from "@/lib/agent-client";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string }
  | { kind: "error"; message: string; mailto?: string; fieldErrors?: Record<string, string> };

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);

function calUrl(topic: string, embed: boolean) {
  const params = new URLSearchParams();
  if (embed) {
    params.set("layout", "column_view");
    params.set("theme", "light");
  }
  if (topic) params.set("notes", topic.slice(0, 400));
  const q = params.toString();
  return `${profile.cal}${q ? `?${q}` : ""}`;
}

/* Fallback for people who would rather write than pick a slot. */
function MessageForm({ topic }: { topic: string }) {
  const id = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const fe = status.kind === "error" ? status.fieldErrors ?? {} : {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    // No message backend configured: hand the message to the visitor's email app.
    if (!AGENT_URL) {
      const subject = encodeURIComponent(`Call request from ${data.name ?? ""}`.trim());
      const body = encodeURIComponent(`${data.topic ?? ""}

${data.name ?? ""} <${data.email ?? ""}>`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus({ kind: "sent", name: data.name?.split(" ")[0] ?? "" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(`${AGENT_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, timezone: tz }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        mailto?: string;
        fieldErrors?: Record<string, string>;
      };
      if (res.ok && json.ok) setStatus({ kind: "sent", name: data.name?.split(" ")[0] ?? "" });
      else
        setStatus({
          kind: "error",
          message: json.error ?? "The message did not go through.",
          mailto: json.mailto,
          fieldErrors: json.fieldErrors,
        });
    } catch {
      setStatus({
        kind: "error",
        message: "You seem to be offline. Send it by email instead.",
        mailto: `mailto:${profile.email}?subject=${encodeURIComponent("Call request")}`,
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="done" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 3 3 5-6" />
        </svg>
        <div>
          <h4>Message sent{status.name ? `, ${status.name}` : ""}</h4>
          <p>Murtaza will reply by email, usually within a day.</p>
        </div>
      </div>
    );
  }

  const field = (name: string, label: string, el: React.ReactNode) => (
    <div className="field" data-invalid={!!fe[name]}>
      <label htmlFor={`${id}-${name}`}>{label}</label>
      {el}
      {fe[name] && <div className="fe">{fe[name]}</div>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="row2">
        {field("name", "Name", <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={80} />)}
        {field("email", "Email", <input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={120} />)}
      </div>
      {field(
        "topic",
        "What do you want to build or discuss?",
        <textarea id={`${id}-topic`} name="topic" defaultValue={topic} required maxLength={1200} rows={3} />,
      )}
      <div className="hp" aria-hidden="true">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {status.kind === "error" && (
        <p className="fail" role="alert">
          {status.message} {status.mailto && <a href={status.mailto}>Email {profile.email}</a>}
        </p>
      )}
      <button className="btn btn-ghost" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending message" : "Send message"}
      </button>
    </form>
  );
}

export function BookingForm({ topic = "" }: { topic?: string }) {
  const [mode, setMode] = useState<"calendar" | "message">("calendar");
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="book">
      <div className="book-head">
        <div>
          <h4>Book a 15-minute call</h4>
          <p>Pick a slot; it lands straight in Murtaza&apos;s calendar with a video link.</p>
        </div>
        <a className="pill" href={calUrl(topic, false)} target="_blank" rel="noreferrer">
          Open in Cal.com
          <Arrow />
        </a>
      </div>

      {mode === "calendar" ? (
        <div className="cal-frame" data-loaded={loaded}>
          {!loaded && <div className="cal-loading">Loading calendar</div>}
          <iframe
            title="Book a 15-minute call with Murtaza on Cal.com"
            src={calUrl(topic, true)}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            allow="payment"
          />
        </div>
      ) : (
        <MessageForm topic={topic} />
      )}

      <button type="button" className="book-switch" onClick={() => setMode(mode === "calendar" ? "message" : "calendar")}>
        {mode === "calendar" ? "Prefer to write? Send a message instead" : "Back to the calendar"}
      </button>
    </div>
  );
}
