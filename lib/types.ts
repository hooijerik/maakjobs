// Shared domain types for maakjobs.nl

export type CategorySlug =
  | "werktuigbouw"
  | "elektrotechniek"
  | "installatie-klimaat"
  | "onderhoud-service"
  | "engineering"
  | "mechatronica-proces"
  | "productie-montage"
  | "overig-techniek";

export type SenioritySlug =
  | "leerling"
  | "junior"
  | "allround"
  | "senior"
  | "voorman"
  | "leidinggevend";

export type WorkMode = "remote" | "hybrid" | "onsite";

export type AtsType =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "recruitee"
  | "homerun"
  | "personio"
  | "workable"
  | "smartrecruiters";

export type AggregatorType = "indeed" | "nationalevacaturebank" | "magnet" | "linkedin";

export type SourceType = AtsType | AggregatorType;

export type SalaryInterval = "year" | "month" | "hour";

/** A job as returned by a scraper adapter, before classification/normalization. */
export interface RawJob {
  source: SourceType;
  /** Stable id from the source (used for dedup/upsert). */
  sourceId: string;
  companyName: string;
  /** ATS slug / handle, when known (for company linking). */
  companyHandle?: string;
  companyWebsite?: string;
  /** Direct company logo URL from the source (e.g. LinkedIn's media.licdn.com image). */
  companyLogo?: string;
  title: string;
  /** Canonical posting URL on the source. */
  url: string;
  /** Direct apply URL, if different from `url`. */
  applyUrl?: string;
  descriptionHtml?: string;
  descriptionText?: string;
  locationRaw?: string;
  department?: string;
  team?: string;
  employmentType?: string;
  /** ISO date string when the job was posted/updated at the source. */
  postedAt?: string;
  /** Structured comp from the source (Ashby), if available. */
  compensation?: {
    min?: number;
    max?: number;
    currency?: string;
    interval?: SalaryInterval;
  };
}

export interface ParsedSalary {
  min: number | null;
  max: number | null;
  currency: string; // ISO-ish, e.g. "EUR", "USD"
  interval: SalaryInterval;
  disclosed: boolean;
}

export interface ParsedLocation {
  city: string | null;
  province: string | null;
  country: string | null; // ISO-2-ish: "NL", "BE", "DE", "REMOTE", or null
  nlRelevant: boolean;
}

export interface Classification {
  category: CategorySlug;
  seniority: SenioritySlug | null;
  workMode: WorkMode | null;
  location: ParsedLocation;
  salary: ParsedSalary;
  tools: string[]; // tool slugs
  aiRequired: boolean;
  reportsTo: string | null;
  compStructure: string | null; // "base+bonus" | "base+commission" | "base" | "ote" | null
  equityType: string | null; // "options" | "rsu" | "equity" | null
  lang: "nl" | "en"; // detected language of the posting text
  /** false => not a relevant technical role, should be dropped */
  gtmRelevant: boolean;
}

/** Row shape as stored in / read from the `jobs` table. */
export interface JobRow {
  id: number;
  source: string;
  source_id: string;
  company_id: number;
  company_name: string;
  company_slug: string;
  company_logo: string | null;
  title: string;
  title_norm: string;
  slug: string;
  url: string;
  apply_url: string | null;
  description_html: string | null;
  description_text: string | null;
  location_raw: string | null;
  city: string | null;
  city_slug: string | null;
  province: string | null;
  country: string | null;
  work_mode: WorkMode | null;
  category: CategorySlug;
  seniority: SenioritySlug | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_interval: SalaryInterval | null;
  salary_min_eur: number | null; // annualized EUR, for filtering/sorting/reporting
  salary_max_eur: number | null;
  salary_disclosed: number; // 0/1
  comp_structure: string | null;
  equity_type: string | null;
  tools_json: string | null;
  reports_to: string | null;
  ai_required: number; // 0/1
  lang: string; // "nl" | "en"
  posted_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  status: "active" | "expired";
  featured: number; // 0/1 — paid premium placement
  featured_until: string | null; // ISO datetime; null = no expiry
  hash: string;
}

export interface CompanyRow {
  id: number;
  name: string;
  slug: string;
  website: string | null;
  ats_type: string | null;
  ats_slug: string | null;
  logo_url: string | null;
  hq_city: string | null;
  size: string | null;
  industry: string | null;
  featured: number; // 0/1 — paid featured employer
  featured_until: string | null; // ISO datetime; null = no expiry
}

export type PremiumKind = "job" | "company" | "combo";
export type PremiumStatus = "lead" | "invoiced" | "paid" | "active" | "expired" | "cancelled";

/** Row shape of the `premium_orders` table (paid placements / leads). */
export interface PremiumOrderRow {
  id: number;
  kind: PremiumKind;
  job_id: number | null;
  company_id: number | null;
  buyer_email: string | null;
  company_name: string | null;
  package: string | null;
  amount_eur: number | null;
  status: PremiumStatus;
  starts_at: string | null;
  expires_at: string | null;
  stripe_invoice_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface SeedCompany {
  name: string;
  atsType: AtsType;
  atsSlug: string;
  website?: string;
  size?: string;
  industry?: string;
}
