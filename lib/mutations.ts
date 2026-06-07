// Server-only writes used by API route handlers (alerts + employer submissions) and the
// admin (manual/paid premium placements).
import crypto from "node:crypto";
import { getDb } from "./db";
import { sendEmail, esc } from "./email";
import { SITE } from "./site";
import { classify, stripHtml } from "./classify";
import { slugify, toAnnualEUR } from "./format";
import type {
  CategorySlug,
  SenioritySlug,
  RawJob,
  PremiumKind,
  PremiumStatus,
  PremiumOrderRow,
} from "./types";

/** Where employer job submissions are forwarded. */
const SUBMISSIONS_TO = process.env.SUBMISSIONS_TO_EMAIL || "info@maakjobs.nl";

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export async function addSubscriber(
  email: string,
  filters?: Record<string, string | number>,
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

// ---------------------------------------------------------------------------
// Paid premium placements (manual/invoice MVP): create a live featured job,
// toggle featured on jobs/companies, and track orders/leads in premium_orders.
// ---------------------------------------------------------------------------

function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex");
}

/** Upsert a company by name (manual entry); derive a favicon logo from the website. */
function upsertCompanyManual(name: string, website?: string | null): number {
  const db = getDb();
  const slug = slugify(name);
  let logo: string | null = null;
  if (website) {
    try {
      const host = new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(
        /^www\./,
        "",
      );
      logo = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch {
      /* ignore */
    }
  }
  db.prepare(`INSERT OR IGNORE INTO companies (name, slug, website, logo_url) VALUES (?,?,?,?)`).run(
    name,
    slug,
    website ?? null,
    logo,
  );
  db.prepare(
    `UPDATE companies SET website=COALESCE(website,?), logo_url=COALESCE(logo_url,?) WHERE slug=?`,
  ).run(website ?? null, logo, slug);
  return (db.prepare(`SELECT id FROM companies WHERE slug=?`).get(slug) as { id: number }).id;
}

export interface ManualJobInput {
  companyName: string;
  companyWebsite?: string | null;
  title: string;
  url: string;
  applyUrl?: string | null;
  descriptionHtml?: string | null;
  descriptionText?: string | null;
  locationRaw?: string | null;
  /** Overrides for the auto-classification. */
  category?: CategorySlug;
  seniority?: SenioritySlug | null;
  /** Paid placement controls. */
  featured?: boolean; // default true
  featuredDays?: number; // default 30; ignored when featured is false
}

/**
 * Create a live, manually-entered job (source='manual', so the scraper never touches it).
 * Auto-classifies category/seniority/location/salary from the pasted content (with optional
 * overrides) and publishes it as a paid featured placement by default.
 */
export function createManualJob(input: ManualJobInput): { id: number; slug: string } {
  const db = getDb();
  const raw: RawJob = {
    source: "manual" as RawJob["source"],
    sourceId: "",
    companyName: input.companyName,
    companyWebsite: input.companyWebsite ?? undefined,
    title: input.title,
    url: input.url,
    applyUrl: input.applyUrl ?? undefined,
    descriptionHtml: input.descriptionHtml ?? undefined,
    descriptionText: input.descriptionText ?? undefined,
    locationRaw: input.locationRaw ?? undefined,
  };
  const cls = classify(raw);
  const category: CategorySlug = input.category ?? (cls.gtmRelevant ? cls.category : "overig-techniek");
  const seniority = input.seniority !== undefined ? input.seniority : cls.seniority;

  const companyId = upsertCompanyManual(input.companyName.trim(), input.companyWebsite ?? null);
  const title = input.title.trim();
  const company = input.companyName.trim();
  const descHtml = input.descriptionHtml ?? null;
  const descText =
    (input.descriptionText ?? (descHtml ? stripHtml(descHtml) : "")).slice(0, 24000) || null;
  const sourceId = crypto.randomUUID();
  const slug = `${slugify(title)}-${slugify(company)}-${sha1("manual:" + sourceId).slice(0, 8)}`.slice(0, 120);

  const s = cls.salary;
  const minEur = s.min != null ? Math.round(toAnnualEUR(s.min, s.currency, s.interval)) : null;
  const maxEur = s.max != null ? Math.round(toAnnualEUR(s.max, s.currency, s.interval)) : minEur;
  const citySlug = cls.location.city ? slugify(cls.location.city) : null;
  const toolsJson = JSON.stringify(cls.tools);
  const hashStr = sha1(
    [title, company, input.locationRaw ?? "", s.min ?? "", s.max ?? "", descText?.length ?? 0].join("|"),
  );

  const featured = input.featured !== false;
  const days = Math.max(1, Math.floor(input.featuredDays ?? 30));
  const untilSql = featured ? `+${days} days` : null;
  const featuredUntilExpr = untilSql ? "datetime('now', ?)" : "NULL";

  const sql = `INSERT INTO jobs (
    source, source_id, company_id, title, title_norm, slug, url, apply_url,
    description_html, description_text, location_raw, city, city_slug, province, country,
    work_mode, category, seniority, employment_type,
    salary_min, salary_max, salary_currency, salary_interval, salary_min_eur, salary_max_eur, salary_disclosed,
    comp_structure, equity_type, tools_json, reports_to, ai_required, lang,
    posted_at, last_seen_at, status, hash, featured, featured_until
  ) VALUES (
    'manual', ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    datetime('now'), datetime('now'), 'active', ?, ?, ${featuredUntilExpr})`;

  const params: (string | number | null)[] = [
    sourceId, companyId, title, title.toLowerCase(), slug, input.url, input.applyUrl ?? null,
    descHtml, descText, input.locationRaw ?? null, cls.location.city, citySlug, cls.location.province, cls.location.country,
    cls.workMode, category, seniority, null,
    s.min, s.max, s.currency, s.interval, minEur, maxEur, s.disclosed ? 1 : 0,
    cls.compStructure, cls.equityType, toolsJson, cls.reportsTo, cls.aiRequired ? 1 : 0, cls.lang,
    hashStr, featured ? 1 : 0,
  ];
  if (untilSql) params.push(untilSql);

  const res = db.prepare(sql).run(...params);
  return { id: Number(res.lastInsertRowid), slug };
}

/** Set/clear the paid 'featured' flag on a job. `untilSql` is a SQLite datetime modifier
 *  like '+30 days' (kept format-consistent with datetime('now')), or null for no expiry. */
export function setJobFeatured(jobId: number, featured: boolean, untilSql?: string | null): void {
  const db = getDb();
  if (!featured) db.prepare("UPDATE jobs SET featured=0, featured_until=NULL WHERE id=?").run(jobId);
  else if (untilSql)
    db.prepare("UPDATE jobs SET featured=1, featured_until=datetime('now', ?) WHERE id=?").run(untilSql, jobId);
  else db.prepare("UPDATE jobs SET featured=1, featured_until=NULL WHERE id=?").run(jobId);
}

export function setCompanyFeatured(companyId: number, featured: boolean, untilSql?: string | null): void {
  const db = getDb();
  if (!featured) db.prepare("UPDATE companies SET featured=0, featured_until=NULL WHERE id=?").run(companyId);
  else if (untilSql)
    db.prepare("UPDATE companies SET featured=1, featured_until=datetime('now', ?) WHERE id=?").run(untilSql, companyId);
  else db.prepare("UPDATE companies SET featured=1, featured_until=NULL WHERE id=?").run(companyId);
}

export function createPremiumOrder(o: {
  kind: PremiumKind;
  jobId?: number | null;
  companyId?: number | null;
  buyerEmail?: string | null;
  companyName?: string | null;
  package?: string | null;
  amountEur?: number | null;
  status?: PremiumStatus;
  startsAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}): number {
  const res = getDb()
    .prepare(
      `INSERT INTO premium_orders
         (kind, job_id, company_id, buyer_email, company_name, package, amount_eur, status, starts_at, expires_at, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      o.kind,
      o.jobId ?? null,
      o.companyId ?? null,
      o.buyerEmail ?? null,
      o.companyName ?? null,
      o.package ?? null,
      o.amountEur ?? null,
      o.status ?? "lead",
      o.startsAt ?? null,
      o.expiresAt ?? null,
      o.notes ?? null,
    );
  return Number(res.lastInsertRowid);
}

export function listPremiumOrders(limit = 100): PremiumOrderRow[] {
  return getDb()
    .prepare(`SELECT * FROM premium_orders ORDER BY created_at DESC, id DESC LIMIT ?`)
    .all(limit) as unknown as PremiumOrderRow[];
}

// Whitelisted updatable columns (guards the dynamic UPDATE against injected field names).
const ORDER_FIELDS = new Set([
  "status", "amount_eur", "starts_at", "expires_at", "stripe_invoice_id", "notes",
  "job_id", "company_id", "kind", "package", "buyer_email", "company_name",
]);

export function updatePremiumOrder(id: number, fields: Record<string, string | number | null>): void {
  const keys = Object.keys(fields).filter((k) => ORDER_FIELDS.has(k));
  if (!keys.length) return;
  const set = keys.map((k) => `${k}=?`).join(", ");
  const vals = keys.map((k) => fields[k]);
  getDb().prepare(`UPDATE premium_orders SET ${set} WHERE id=?`).run(...vals, id);
}
