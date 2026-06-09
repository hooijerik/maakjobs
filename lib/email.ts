// Transactional email via Resend (https://resend.com). Reads config from the environment
// at runtime. With no RESEND_API_KEY set it logs a dry-run instead of sending, so local
// development never needs a key. Never throws - returns a status the caller can ignore.
import { SITE } from "./site";

const RESEND_URL = "https://api.resend.com/emails";

/** Verified sending identity. The domain MUST be verified in your Resend account.
 *  Accepts a bare address in ALERTS_FROM_EMAIL (no spaces -> cron/systemd-friendly) and
 *  adds the "Maakjobs" display name; or a full "Name <addr>" value is used as-is. */
export function defaultFrom(): string {
  const v = process.env.ALERTS_FROM_EMAIL?.trim();
  if (!v) return "Maakjobs <vacatures@maakjobs.nl>";
  return v.includes("<") ? v : `Maakjobs <${v}>`;
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}): Promise<"sent" | "dry" | "error"> {
  const key = process.env.RESEND_API_KEY;
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];
  if (!key) {
    console.log(`[email dry-run] → ${to.join(", ")} :: ${opts.subject}`);
    return "dry";
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: opts.from || defaultFrom(),
        to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        ...(opts.headers ? { headers: opts.headers } : {}),
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.error(`Resend ${r.status}: ${await r.text().catch(() => "")}`);
      return "error";
    }
    return "sent";
  } catch (e) {
    console.error(`Resend exception: ${(e as Error).message}`);
    return "error";
  } finally {
    clearTimeout(timer);
  }
}

/** Minimal HTML escaping for interpolating user-submitted values into emails. */
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Per-subscriber links for managing/unsubscribing an alert (token-authenticated). */
export function alertLinks(token: string) {
  const t = encodeURIComponent(token);
  const manage = `${SITE.url}/vacature-alert/beheer?token=${t}`;
  return {
    prefs: manage,
    unsub: `${manage}&actie=uitschrijven`,
    oneClick: `${SITE.url}/api/alerts/unsubscribe?token=${t}`, // for the List-Unsubscribe header
  };
}

/** Standard footer for alert e-mails: why-you-got-this + preferences + unsubscribe links. */
export function alertEmailFooter(token: string): string {
  const l = alertLinks(token);
  return `<p style="color:#94a3b8;font-size:12px;margin-top:20px">
    Je ontvangt deze mail omdat je een vacature-alert hebt op ${SITE.name}.<br>
    <a href="${l.prefs}" style="color:#94a3b8">Voorkeuren aanpassen</a> &middot;
    <a href="${l.unsub}" style="color:#94a3b8">Uitschrijven</a>
  </p>`;
}
