// SQLite connection + schema, using Node's built-in `node:sqlite` (no native build).
// Used by both the scrapers (writes) and the Next.js server components (reads).

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  ats_type TEXT,
  ats_slug TEXT,
  logo_url TEXT,
  hq_city TEXT,
  size TEXT,
  industry TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  title TEXT NOT NULL,
  title_norm TEXT NOT NULL,
  slug TEXT NOT NULL,
  url TEXT NOT NULL,
  apply_url TEXT,
  description_html TEXT,
  description_text TEXT,
  location_raw TEXT,
  city TEXT,
  city_slug TEXT,
  province TEXT,
  country TEXT,
  work_mode TEXT,
  category TEXT NOT NULL,
  seniority TEXT,
  employment_type TEXT,
  salary_min REAL,
  salary_max REAL,
  salary_currency TEXT,
  salary_interval TEXT,
  salary_min_eur REAL,
  salary_max_eur REAL,
  salary_disclosed INTEGER NOT NULL DEFAULT 0,
  comp_structure TEXT,
  equity_type TEXT,
  tools_json TEXT,
  reports_to TEXT,
  ai_required INTEGER NOT NULL DEFAULT 0,
  posted_at TEXT,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'active',
  hash TEXT NOT NULL,
  UNIQUE(source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority);
CREATE INDEX IF NOT EXISTS idx_jobs_city_slug ON jobs(city_slug);
CREATE INDEX IF NOT EXISTS idx_jobs_province ON jobs(province);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_workmode ON jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_status_posted ON jobs(status, posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  filters_json TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  confirmed INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_sent_at TEXT
);

CREATE TABLE IF NOT EXISTS employer_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT,
  contact_email TEXT,
  payload_json TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scrape_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT,
  started_at TEXT,
  finished_at TEXT,
  found INTEGER DEFAULT 0,
  inserted INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  errors_json TEXT
);

-- Paid premium placements (premium/featured vacancy + featured company). Durable
-- record of leads/sales even in the manual/invoice flow; later filled by Stripe.
CREATE TABLE IF NOT EXISTS premium_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,                              -- 'job' | 'company' | 'combo'
  job_id INTEGER REFERENCES jobs(id),
  company_id INTEGER REFERENCES companies(id),
  buyer_email TEXT,
  company_name TEXT,
  package TEXT,
  amount_eur REAL,
  status TEXT NOT NULL DEFAULT 'lead',             -- lead|invoiced|paid|active|expired|cancelled
  starts_at TEXT,
  expires_at TEXT,
  stripe_invoice_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

let _db: DatabaseSync | null = null;

export function dbPath(): string {
  return process.env.MAAKJOBS_DB || path.join(process.cwd(), "data", "maakjobs.db");
}

export function getDb(): DatabaseSync {
  if (_db) return _db;
  const file = dbPath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  // Migrations: add columns to existing DBs (schema uses CREATE TABLE IF NOT EXISTS,
  // which never alters an existing table). Each guard is idempotent.
  const addColumn = (table: string, column: string, ddl: string) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  };
  addColumn("jobs", "lang", "lang TEXT NOT NULL DEFAULT 'nl'");
  // Paid premium placements: a featured flag + an optional expiry on jobs and companies.
  addColumn("jobs", "featured", "featured INTEGER NOT NULL DEFAULT 0");
  addColumn("jobs", "featured_until", "featured_until TEXT");
  addColumn("companies", "featured", "featured INTEGER NOT NULL DEFAULT 0");
  addColumn("companies", "featured_until", "featured_until TEXT");
  db.exec("CREATE INDEX IF NOT EXISTS idx_jobs_lang ON jobs(lang)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured)");
  _db = db;
  return db;
}
