// Server-only writes used by API route handlers (alerts + employer submissions).
import { getDb } from "./db";
import { sendEmail, esc } from "./email";
import { SITE } from "./site";

/** Where employer job submissions are forwarded. */
const SUBMISSIONS_TO = process.env.SUBMISSIONS_TO_EMAIL || "info@maakjobs.nl";

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export async function addSubscriber(
  email: string,
  filters?: Record<string, string>,
  frequency = "daily",
): Promise<{ ok: boolean; error?: string }> {
  const clean = (email || "").trim().toLowerCase();
  if (!isValidEmail(clean)) return { ok: false, error: "Ongeldig e-mailadres" };
  const freq = frequency === "weekly" ? "weekly" : "daily";
  getDb()
    .prepare(
      `INSERT INTO subscribers (email, filters_json, frequency) VALUES (?,?,?)
       ON CONFLICT(email) DO UPDATE SET filters_json=excluded.filters_json, frequency=excluded.frequency`,
    )
    .run(clean, filters && Object.keys(filters).length ? JSON.stringify(filters) : null, freq);

  // Confirmation to the subscriber (best-effort; never blocks the signup).
  await sendEmail({
    to: clean,
    subject: `Je vacature-alert op ${SITE.name} is ingesteld`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#0f172a">Je alert staat aan ✅</h2>
      <p style="color:#334155">Je ontvangt voortaan ${freq === "weekly" ? "wekelijks" : "dagelijks"} de nieuwste
      technische vacatures in Nederland die bij je passen.</p>
      <p><a href="${SITE.url}/vacatures" style="color:#6d28d9;font-weight:600">Bekijk nu alle vacatures →</a></p>
      <p style="color:#94a3b8;font-size:12px">${SITE.name} — vacatures voor techniek en de maakindustrie.</p>
    </div>`,
  });
  return { ok: true };
}

export async function addEmployerSubmission(payload: {
  companyName?: string;
  contactEmail?: string;
  [k: string]: unknown;
}): Promise<{ ok: boolean; error?: string }> {
  if (!payload.contactEmail || !isValidEmail(String(payload.contactEmail))) {
    return { ok: false, error: "Geldig e-mailadres is verplicht" };
  }
  getDb()
    .prepare(
      `INSERT INTO employer_submissions (company_name, contact_email, payload_json) VALUES (?,?,?)`,
    )
    .run(payload.companyName ?? null, payload.contactEmail ?? null, JSON.stringify(payload));

  const rows = Object.entries(payload)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`,
    )
    .join("");

  // Notify the team so a submission never just sits in the database.
  await sendEmail({
    to: SUBMISSIONS_TO,
    subject: `Nieuwe vacature-inzending: ${payload.companyName ?? "onbekend"}`,
    replyTo: String(payload.contactEmail),
    html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#0f172a">Nieuwe vacature-inzending</h2>
      <table style="border-collapse:collapse;font-size:14px">${rows}</table>
    </div>`,
  });

  // Confirmation to the employer.
  await sendEmail({
    to: String(payload.contactEmail),
    subject: `We hebben je vacature ontvangen — ${SITE.name}`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#0f172a">Bedankt voor je inzending 🙌</h2>
      <p style="color:#334155">We hebben je aanmelding${payload.companyName ? ` voor <strong>${esc(payload.companyName)}</strong>` : ""}
      ontvangen en nemen zo snel mogelijk contact met je op via ${esc(payload.contactEmail)}.</p>
      <p style="color:#94a3b8;font-size:12px">${SITE.name} — vacatures voor techniek en de maakindustrie.</p>
    </div>`,
  });
  return { ok: true };
}
