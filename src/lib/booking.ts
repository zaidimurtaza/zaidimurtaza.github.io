import { z } from "zod";
import { profile } from "../content/profile";

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Add your name").max(80),
  email: z.string().trim().email("Use a valid email so Murtaza can reply"),
  company: z.string().trim().max(120).optional().default(""),
  topic: z.string().trim().min(5, "Say a little about what you want to discuss").max(1200),
  slots: z.string().trim().max(300).optional().default(""),
  timezone: z.string().trim().max(64).optional().default(""),
  website: z.string().max(0).optional().default(""), // honeypot, must stay empty
});

export type Booking = z.infer<typeof bookingSchema>;

export type BookingResult =
  | { ok: true; channel: "email" | "webhook" }
  | { ok: false; reason: "not-configured" | "delivery-failed" };

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

// Delivers a call request. Uses Resend if RESEND_API_KEY is set, otherwise a generic
// webhook (Slack, Zapier, Make, n8n...) if BOOKING_WEBHOOK_URL is set.
export type BookingEnv = {
  RESEND_API_KEY?: string;
  BOOKING_TO_EMAIL?: string;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_WEBHOOK_URL?: string;
};

export async function deliverBooking(b: Booking, env: BookingEnv): Promise<BookingResult> {
  const lines = [
    `Name: ${b.name}`,
    `Email: ${b.email}`,
    b.company ? `Company: ${b.company}` : null,
    b.slots ? `Preferred times: ${b.slots}` : null,
    b.timezone ? `Time zone: ${b.timezone}` : null,
    "",
    b.topic,
  ].filter((l): l is string => l !== null);

  const resendKey = env.RESEND_API_KEY;
  if (resendKey) {
    const to = env.BOOKING_TO_EMAIL || profile.email;
    const from = env.BOOKING_FROM_EMAIL || "Portfolio agent <onboarding@resend.dev>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: b.email,
          subject: `Call request from ${b.name}${b.company ? ` (${b.company})` : ""}`,
          text: lines.join("\n"),
          html: `<pre style="font:14px/1.5 system-ui">${escape(lines.join("\n"))}</pre>`,
        }),
      });
      if (res.ok) return { ok: true, channel: "email" };
      console.error("[booking] resend failed", res.status, await res.text().catch(() => ""));
    } catch (err) {
      console.error("[booking] resend error", err);
    }
  }

  const hook = env.BOOKING_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `New call request\n${lines.join("\n")}`, booking: b }),
      });
      if (res.ok) return { ok: true, channel: "webhook" };
      console.error("[booking] webhook failed", res.status);
    } catch (err) {
      console.error("[booking] webhook error", err);
    }
  }

  return { ok: false, reason: resendKey || hook ? "delivery-failed" : "not-configured" };
}
