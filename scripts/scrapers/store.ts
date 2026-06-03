// Persistence: classify a RawJob and upsert it into the DB. Used only by scrapers.

import crypto from "node:crypto";
import { getDb } from "../../lib/db";
import { classify, stripHtml } from "../../lib/classify";
import { slugify, toAnnualEUR } from "../../lib/format";
import type { AtsType, RawJob } from "../../lib/types";

const AGGREGATORS = new Set(["indeed", "nationalevacaturebank", "magnet", "linkedin"]);

function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex");
}

function logoFor(website?: string | null): string | null {
  if (!website) return null;
  try {
    const host = new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(
      /^www\./,
      "",
    );
    // Google's favicon service is reliable and CORS-friendly; clearbit's logo API is
    // not reachable. `fetch-logos` later verifies/fills logos for companies without a
    // known website (e.g. aggregator-sourced ones).
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return null;
  }
}

export function upsertCompany(
  name: string,
  opts: { website?: string | null; atsType?: AtsType | null; atsSlug?: string | null } = {},
): number {
  const db = getDb();
  const slug = slugify(name);
  const logo = logoFor(opts.website);
  db.prepare(
    `INSERT OR IGNORE INTO companies (name, slug, website, ats_type, ats_slug, logo_url) VALUES (?,?,?,?,?,?)`,
  ).run(name, slug, opts.website ?? null, opts.atsType ?? null, opts.atsSlug ?? null, logo);
  db.prepare(
    `UPDATE companies SET website=COALESCE(website,?), ats_type=COALESCE(ats_type,?),
       ats_slug=COALESCE(ats_slug,?), logo_url=COALESCE(logo_url,?) WHERE slug=?`,
  ).run(opts.website ?? null, opts.atsType ?? null, opts.atsSlug ?? null, logo, slug);
  const row = db.prepare(`SELECT id FROM companies WHERE slug=?`).get(slug) as { id: number };
  return row.id;
}

export type UpsertResult = "inserted" | "updated" | "unchanged" | "skipped-nongtm" | "skipped-notnl";

const INSERT_SQL = `INSERT INTO jobs (
  source, source_id, company_id, title, title_norm, slug, url, apply_url,
  description_html, description_text, location_raw, city, city_slug, province, country,
  work_mode, category, seniority, employment_type,
  salary_min, salary_max, salary_currency, salary_interval, salary_min_eur, salary_max_eur, salary_disclosed,
  comp_structure, equity_type, tools_json, reports_to, ai_required, lang,
  posted_at, last_seen_at, status, hash
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime(?),datetime('now'),'active',?)`;

const UPDATE_SQL = `UPDATE jobs SET
  company_id=?, title=?, title_norm=?, slug=?, url=?, apply_url=?,
  description_html=?, description_text=?, location_raw=?, city=?, city_slug=?, province=?, country=?,
  work_mode=?, category=?, seniority=?, employment_type=?,
  salary_min=?, salary_max=?, salary_currency=?, salary_interval=?, salary_min_eur=?, salary_max_eur=?, salary_disclosed=?,
  comp_structure=?, equity_type=?, tools_json=?, reports_to=?, ai_required=?, lang=?,
  posted_at=datetime(?), last_seen_at=datetime('now'), status='active', hash=?
WHERE id=?`;

export function upsertJob(raw: RawJob): UpsertResult {
  const cls = classify(raw);
  if (!cls.gtmRelevant) return "skipped-nongtm";
  if (!cls.location.nlRelevant) return "skipped-notnl";

  const db = getDb();
  const isAts = !AGGREGATORS.has(raw.source);
  const companyId = upsertCompany(raw.companyName, {
    website: raw.companyWebsite ?? null,
    atsType: isAts ? (raw.source as AtsType) : null,
    atsSlug: raw.companyHandle ?? null,
  });

  const title = raw.title.trim();
  const company = raw.companyName.trim();
  const descHtml = raw.descriptionHtml ?? null;
  const descText =
    (raw.descriptionText ?? (descHtml ? stripHtml(descHtml) : "")).slice(0, 24000) || null;
  const slug = `${slugify(title)}-${slugify(company)}-${sha1(raw.source + ":" + raw.sourceId).slice(0, 8)}`.slice(
    0,
    120,
  );
  const s = cls.salary;
  const minEur = s.min != null ? Math.round(toAnnualEUR(s.min, s.currency, s.interval)) : null;
  const maxEur =
    s.max != null ? Math.round(toAnnualEUR(s.max, s.currency, s.interval)) : minEur;
  const citySlug = cls.location.city ? slugify(cls.location.city) : null;
  const toolsJson = JSON.stringify(cls.tools);
  const hashStr = sha1(
    [title, company, raw.locationRaw ?? "", s.min ?? "", s.max ?? "", descText?.length ?? 0].join("|"),
  );
  const postedAt = raw.postedAt ?? null;

  const existing = db
    .prepare(`SELECT id, hash FROM jobs WHERE source=? AND source_id=?`)
    .get(raw.source, raw.sourceId) as { id: number; hash: string } | undefined;

  const common = [
    companyId,
    title,
    title.toLowerCase(),
    slug,
    raw.url,
    raw.applyUrl ?? null,
    descHtml,
    descText,
    raw.locationRaw ?? null,
    cls.location.city,
    citySlug,
    cls.location.province,
    cls.location.country,
    cls.workMode,
    cls.category,
    cls.seniority,
    raw.employmentType ?? null,
    s.min,
    s.max,
    s.currency,
    s.interval,
    minEur,
    maxEur,
    s.disclosed ? 1 : 0,
    cls.compStructure,
    cls.equityType,
    toolsJson,
    cls.reportsTo,
    cls.aiRequired ? 1 : 0,
    cls.lang,
    postedAt,
    hashStr,
  ];

  if (!existing) {
    db.prepare(INSERT_SQL).run(raw.source, raw.sourceId, ...common);
    return "inserted";
  }
  db.prepare(UPDATE_SQL).run(...common, existing.id);
  return existing.hash === hashStr ? "unchanged" : "updated";
}

export function runStartStamp(): string {
  return (getDb().prepare("SELECT datetime('now') AS t").get() as { t: string }).t;
}

/** Mark active jobs from a fully-scraped ATS company that weren't seen this run as expired. */
export function expireCompanyJobs(source: string, companyId: number, runStart: string): number {
  const res = getDb()
    .prepare(
      `UPDATE jobs SET status='expired'
       WHERE source=? AND company_id=? AND status='active' AND last_seen_at < ?`,
    )
    .run(source, companyId, runStart);
  return Number(res.changes ?? 0);
}

export function recordRun(
  source: string,
  startedAt: string,
  found: number,
  inserted: number,
  updated: number,
  errors: string[],
): void {
  getDb()
    .prepare(
      `INSERT INTO scrape_runs (source, started_at, finished_at, found, inserted, updated, errors_json)
       VALUES (?,?,datetime('now'),?,?,?,?)`,
    )
    .run(source, startedAt, found, inserted, updated, errors.length ? JSON.stringify(errors) : null);
}
