// Classification pipeline: turn a RawJob into a structured Classification.
// Heuristic, Dutch-focused. Tuned for technical / maakindustrie roles. Covered by tests/classify.test.ts.

import {
  CATEGORIES,
  CITY_PROVINCE,
  BE_CITY_PROVINCE,
  TECH_SIGNAL_KEYWORDS,
  HARD_EXCLUDE_KEYWORDS,
  SENIORITY,
  WORK_MODES,
} from "./taxonomy";
import { titleCase } from "./format";
import type {
  CategorySlug,
  Classification,
  ParsedLocation,
  ParsedSalary,
  RawJob,
  SalaryInterval,
  SenioritySlug,
  WorkMode,
} from "./types";

function norm(s: string | undefined | null): string {
  return (s || "").toLowerCase();
}

// --- word-boundary keyword matching (cached) ---
const reCache = new Map<string, RegExp>();
function boundary(keyword: string): RegExp {
  const key = keyword.trim();
  let re = reCache.get(key);
  if (!re) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, "i");
    reCache.set(key, re);
  }
  return re;
}
function hasKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((k) => boundary(k).test(text));
}

// --- category ---
export function detectCategory(title: string): CategorySlug | null {
  const t = norm(title);
  for (const c of CATEGORIES) {
    if (hasKeyword(t, c.keywords)) return c.slug;
  }
  return null;
}

// --- seniority ---
export function detectSeniority(title: string): SenioritySlug | null {
  const t = norm(title);
  for (const s of SENIORITY) {
    if (hasKeyword(t, s.keywords)) return s.slug;
  }
  return null;
}

// --- work mode ---
export function detectWorkMode(locationRaw: string | undefined, text: string): WorkMode | null {
  const loc = norm(locationRaw);
  const hybrid = WORK_MODES[1].keywords;
  const remote = WORK_MODES[0].keywords;
  const onsite = WORK_MODES[2].keywords;
  if (loc) {
    if (hasKeyword(loc, hybrid)) return "hybrid";
    if (hasKeyword(loc, remote)) return "remote";
    if (hasKeyword(loc, onsite)) return "onsite";
    return "onsite"; // a concrete location with no mode word => on-site
  }
  if (hasKeyword(text, hybrid)) return "hybrid";
  if (hasKeyword(text, remote)) return "remote";
  return null;
}

// --- location ---
const COUNTRY_PATTERNS: { code: string; kws: string[] }[] = [
  { code: "NL", kws: ["netherlands", "nederland", "the netherlands", "holland", "benelux"] },
  { code: "BE", kws: ["belgium", "belgië", "belgie", "vlaanderen", "flanders"] },
  { code: "DE", kws: ["germany", "deutschland", "duitsland"] },
  { code: "GB", kws: ["united kingdom", "england", "london", "uk"] },
  { code: "FR", kws: ["france", "frankrijk", "paris"] },
  { code: "ES", kws: ["spain", "spanje", "madrid", "barcelona"] },
  { code: "US", kws: ["united states", "usa", "new york", "san francisco"] },
];
const EU_BROAD = /\b(netherlands|nederland|benelux|belgium|belgië|belgie|vlaanderen|flanders|brussels|brussel|emea|eea|european union|europe|european|eu)\b/i;

// Clearly non-European territories that, when named in a job TITLE, indicate the role
// is region-locked (covers that market) even if the location field just says "Remote".
const NON_EU_TERRITORY =
  /\b(israel|south africa|middle east|mena|apac|latam|americas|north america|south america|australia|new zealand|india|japan|korea|singapore|saudi|uae|dubai|qatar|brazil|mexico|argentina|colombia|nigeria|kenya|egypt|turkey|vietnam|indonesia|thailand|philippines|malaysia|hong kong|taiwan|china|united states|canada)\b/i;

/** Decide eligibility from the (short, reliable) location field alone. */
function eligibilityFromLocation(loc: string): "nl" | "blocked" | "unknown" {
  const cleaned = loc
    .toLowerCase()
    .replace(/\b(remote|hybrid|fully|first|on-?site|work from home|wfh|op afstand|thuiswerken|thuis|flexible|based)\b/g, " ")
    .replace(/[(),.\-\u2013\u2014/|:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "unknown";
  if (/\b(worldwide|anywhere|global|globally|international|distributed|home)\b/.test(cleaned)) return "unknown";
  if (EU_BROAD.test(cleaned)) return "nl";
  return "blocked"; // names a specific place that isn't NL / EU-wide
}

/**
 * Whether a REMOTE role is realistically doable from the Netherlands.
 *  "nl"      = NL, or EU/EMEA/Europe-wide, or explicit NL/EU eligibility
 *  "blocked" = tied to a specific non-NL country/region (US, India, Italy, North America, …)
 *  "unknown" = global / "anywhere" / unspecified ("Remote")
 * The LOCATION field is authoritative; the description is consulted only when the
 * location is generic - and even then a bare "Europe" mention does not override a
 * concrete location. The US abbreviation is matched as uppercase `US` to avoid the
 * pronoun "us" ("join us", "about us") that appears in nearly every posting.
 */
export function remoteEligibility(locationRaw: string, text: string): "nl" | "blocked" | "unknown" {
  const loc = locationRaw || "";
  if (loc.trim()) {
    const fromLoc = eligibilityFromLocation(loc);
    if (fromLoc !== "unknown") return fromLoc;
  }

  // Location is generic/empty - consult the description for EXPLICIT signals only.
  const blob = text || "";
  if (
    /\b(based|located|eligible to work|authoriz\w+ to work|reside|residing|open to candidates)\b[^.\n]{0,30}\b(netherlands|nederland|europe|european union|emea|the eu|eu)\b/i.test(
      blob,
    )
  ) {
    return "nl";
  }

  // A clearly non-European territory in the job TITLE means it's region-locked.
  const titleLine = blob.split("\n")[0] || "";
  if (NON_EU_TERRITORY.test(titleLine) || /\bUS\b|\bUSA\b/.test(titleLine)) return "blocked";

  const usCI =
    /\b(based|located|reside|residing|authoriz\w+ to work|eligible to work|work authorization|must (be|reside))\b[^.\n]{0,28}\b(united states|u\.s\.a?\.?|usa)\b/i;
  const usOnly = /\b(united states|usa)\b[^.\n]{0,15}\b(only|based|residents?)\b/i;
  const usAbbr =
    /\bUS[\s-]?(based|only|remote)\b|\b(based|located|reside|residing) in (the )?US\b|\bauthoriz\w+ to work in (the )?US\b/;
  const otherCI =
    /\b(based|located|reside|residing|authoriz\w+ to work|eligible to work)\b[^.\n]{0,28}\b(canada|india|australia|united kingdom|singapore|brazil|japan|latam|apac)\b/i;
  if (usCI.test(blob) || usOnly.test(blob) || usAbbr.test(blob) || otherCI.test(blob)) return "blocked";

  return "unknown";
}

export function detectLocation(locationRaw: string | undefined, text: string): ParsedLocation {
  const loc = norm(locationRaw);
  const scan = loc || norm(text).slice(0, 400);

  // city + province (NL first, then Dutch-speaking Belgium)
  let city: string | null = null;
  let province: string | null = null;
  let cityCountry: string | null = null;
  for (const key of Object.keys(CITY_PROVINCE)) {
    if (boundary(key).test(scan)) {
      city = titleCase(key);
      province = CITY_PROVINCE[key];
      cityCountry = "NL";
      break;
    }
  }
  if (!city) {
    for (const key of Object.keys(BE_CITY_PROVINCE)) {
      if (boundary(key).test(scan)) {
        city = titleCase(key);
        province = BE_CITY_PROVINCE[key];
        cityCountry = "BE";
        break;
      }
    }
  }

  // country
  let country: string | null = null;
  for (const { code, kws } of COUNTRY_PATTERNS) {
    if (hasKeyword(scan, kws)) {
      country = code;
      break;
    }
  }
  // Bare 2-letter country code in the location field (e.g. "Rijssen, NL" / "Oss, BE").
  if (!country && loc) {
    const m = loc.match(/(?:^|[,\s])(nl|be|de|gb|uk|fr|es|us|at|ch|ie)\b\s*$/);
    if (m) country = m[1] === "uk" ? "GB" : m[1].toUpperCase();
  }
  if (!country) country = cityCountry; // a known city implies its country

  const isRemote = hasKeyword(scan, WORK_MODES[0].keywords);

  // Keep NL + Dutch-speaking Belgium. For remote roles, verify they can realistically
  // be performed from the Benelux.
  let nlRelevant: boolean;
  if (province != null || country === "NL" || country === "BE") {
    nlRelevant = true; // a concrete NL/Flemish location
  } else if (isRemote) {
    const elig = remoteEligibility(locationRaw ?? "", text);
    nlRelevant = elig === "nl" ? true : elig === "blocked" ? false : country == null;
  } else {
    nlRelevant = false; // on-site/hybrid outside NL/BE
  }

  return { city, province, country, nlRelevant };
}

// --- salary parsing ---
function parseAmount(raw: string): number | null {
  let s = raw.trim().toLowerCase();
  const hasK = /k$/.test(s);
  s = s.replace(/[€$£]/g, "").replace(/\s/g, "").replace(/k$/, "");
  if (!s) return null;

  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    // last separator is the decimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    // comma = thousands if followed by 3 digits, else decimal
    s = /,\d{3}(\D|$)/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (hasDot) {
    s = /\.\d{3}(\D|$)/.test(s) ? s.replace(/\./g, "") : s;
  }

  let n = Number(s);
  if (Number.isNaN(n)) return null;
  if (hasK) n *= 1000;
  return n;
}

const SAL_RANGES: Record<SalaryInterval, [number, number]> = {
  year: [15000, 700000],
  month: [1200, 45000],
  hour: [8, 250],
};

export function parseSalary(text: string): ParsedSalary {
  const t = text.toLowerCase();

  // currency
  let currency = "EUR";
  if (/[€]|eur\b/.test(t)) currency = "EUR";
  else if (/[$]|usd\b/.test(t)) currency = "USD";
  else if (/[£]|gbp\b/.test(t)) currency = "GBP";

  // interval
  let interval: SalaryInterval = "year";
  if (/per maand|p\/m\b|\/maand|per month|monthly|maandsalaris|bruto per maand/.test(t)) {
    interval = "month";
  } else if (/per uur|\/uur|per hour|hourly|\/hr\b|p\/uur/.test(t)) {
    interval = "hour";
  }

  // Gather monetary amounts and tag each by the word beside it, so a bonus/OTE figure
  // ("42k basis + 15k bonus") isn't mistaken for the bottom of the base range. To stay
  // sharp, a number only counts as salary when it is currency-prefixed OR sits next to a
  // salary cue; counts ("30,000 users", "500,000 companies"), retirement plans ("401k")
  // and revenue/quota figures are rejected.
  const OTE_RE = /^(ote|ontarget)/;
  const VAR_RE = /^(bonus|commissie|commission|variabel|variable|provisie|incentive)/;
  const BASE_RE = /^(basis|base|vast|fixed|bruto|salaris|salary|grondslag)/;
  const SALARY_CTX =
    /salar|compensa|vergoeding|\bloon\b|\bwage\b|\bpay\b|package|\bote\b|on[ -]?target|\bbasis\b|\bbase\b|bruto|netto|per\s?(?:jaar|maand|year|month|annum|week|uur|hour)|p\/m\b|\/(?:jaar|maand|year|month|yr|mo)\b|verdien|\bearn|\bbonus|commiss|\bbieden\b|\boffer|\btot\b|vanaf|indicat/i;
  const NON_SALARY =
    /^[\s+>~–—-]*(employees?|medewerkers?|fte|users?|gebruikers?|customers?|klanten|clients?|companies|bedrijven|businesses|devices?|apparaten|specialists?|people|persons?|seats?|leads?|accounts?|members?|stores?|shops?|locations?|countries|landen|languages|talen|integrations?|partners?|projects?|downloads?|reviews?|stars?|revenue|omzet|arr|mrr|targets?|quota|funding|valuation|budget|pipeline|deals?)\b/i;
  // Business-metric words just BEFORE a number -> it's a deal/quota/revenue figure, not pay.
  const DEAL_CTX =
    /\b(deals?|values?|valued|acv|tcv|contracts?|quotas?|revenue|omzet|arr|mrr|funding|raised|valuation|pipeline|portfolio|turnover|savings?|discount)\b/i;
  const [lo, hi] = SAL_RANGES[interval];
  const titleEnd = text.indexOf("\n") >= 0 ? text.indexOf("\n") : text.length;
  const base: number[] = [];
  const bonus: number[] = [];
  const ote: number[] = [];
  const tokenRe = /(€|eur|\$|usd|£|gbp)\s?(\d[\d.,]*\s?k?)|(\d{1,3}(?:[.,]\d{3})+)|(\d{2,3}\s?k)\b/gi;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = tokenRe.exec(text)) !== null) {
    if (++count > 60) break;
    const isCurrency = !!m[1];
    const numTok = (m[2] || m[3] || m[4] || "").replace(/\s/g, "");
    const val = parseAmount(numTok);
    if (val == null || val < lo || val > hi) continue;
    if (/^40[13]\(?[kb]\)?$/i.test(numTok)) continue; // 401k / 403b retirement plans
    const end = m.index + m[0].length;
    const after = text.slice(end, end + 18).split("\n")[0]; // same line only
    if (NON_SALARY.test(after)) continue; // "30,000 users", "120k quota", "2m ARR", ...
    if (DEAL_CTX.test(text.slice(Math.max(0, m.index - 24), m.index))) continue; // "deal value of €150k"
    if (!isCurrency) {
      // a bare number is salary only in the title (titles advertise pay) or near a salary cue
      const inTitle = m.index < titleEnd;
      if (!inTitle && !SALARY_CTX.test(text.slice(Math.max(0, m.index - 45), end + 22))) continue;
    }
    const nextWord = (after.toLowerCase().match(/[a-z]{2,}/) || [""])[0];
    const prevWord = (text.slice(Math.max(0, m.index - 14), m.index).toLowerCase().match(/[a-z]{2,}(?=[^a-z]*$)/) || [""])[0];
    const tagOf = (w: string) => (OTE_RE.test(w) ? ote : VAR_RE.test(w) ? bonus : BASE_RE.test(w) ? base : null);
    (tagOf(nextWord) ?? tagOf(prevWord) ?? base).push(val);
  }

  if (!base.length && !bonus.length && !ote.length) {
    return { min: null, max: null, currency, interval, disclosed: false };
  }

  let min: number;
  let max: number;
  if (base.length) {
    base.sort((a, b) => a - b);
    min = base[0];
    max = base[base.length - 1];
    if (ote.length) max = Math.max(max, ...ote); // an explicit OTE figure caps the top
    else if (bonus.length) max = max + Math.max(...bonus); // base + bonus ≈ OTE
  } else if (ote.length) {
    min = Math.min(...ote);
    max = Math.max(...ote);
  } else {
    // only a bonus/commission figure and no base -> not a reliable salary
    return { min: null, max: null, currency, interval, disclosed: false };
  }
  return { min, max: max === min ? null : max, currency, interval, disclosed: true };
}

// --- AI flag ---
// An "AI role" is signalled by the JOB TITLE. The description is deliberately ignored:
// at AI companies the boilerplate ("AI-powered platform", "generative AI", "LLMs") appears
// in every posting, which would tag plain Sales/CS/BD roles as AI and pollute the filter.
export function detectAI(title: string, _text?: string): boolean {
  return (
    /(?<![a-z0-9])(ai|ml|llm|gpt|genai|gen-ai)(?![a-z0-9])/i.test(title) ||
    /generative ai|machine learning|artificial intelligence|prompt eng/i.test(title)
  );
}

// --- reports-to ---
export function detectReportsTo(text: string): string | null {
  const m =
    /reports?\s+(?:in)?to\s+(?:the\s+)?([a-z][a-z &/]{1,38})/i.exec(text) ||
    /rapporteert\s+aan\s+(?:de\s+|het\s+)?([a-z][a-z &/]{1,38})/i.exec(text);
  if (!m) return null;
  let v = m[1].trim().replace(/\s+/g, " ");
  v = v.replace(/\b(and|en)\b.*$/i, "").trim();
  if (v.length < 2) return null;
  // Uppercase common acronyms
  return v.replace(/\b(ceo|cro|cmo|cco|cfo|coo|vp|svp)\b/gi, (s) => s.toUpperCase());
}

// --- comp structure + equity ---
function detectComp(text: string, salaryDisclosed: boolean): string | null {
  const t = norm(text);
  if (/\bote\b|on-target earnings|on target earnings/.test(t)) return "ote";
  if (/commission|commissie/.test(t)) return "base+commission";
  if (/\bbonus\b/.test(t)) return "base+bonus";
  return salaryDisclosed ? "base" : null;
}
function detectEquity(text: string): string | null {
  const t = norm(text);
  if (/\brsu(s)?\b/.test(t)) return "rsu";
  if (/stock option|aandelenopties|opties/.test(t)) return "options";
  if (/\bequity\b|aandelen/.test(t)) return "equity";
  return null;
}

// --- text language (Dutch vs English) ---
const NL_MARKERS =
  /(?<![a-z])(de|het|een|en|je|wij|voor|met|van|jij|jou|onze|ervaring|gezocht|functie|werkzaamheden|vereisten|salaris|fulltime|parttime|werken|baan|over ons|ben jij)(?![a-z])/gi;
const EN_MARKERS =
  /(?<![a-z])(the|and|you|we|for|with|our|your|role|experience|looking|requirements|responsibilities|join|the team|full-time|part-time)(?![a-z])/gi;

/** Detect the posting language by counting Dutch vs English marker words. Ties/empty -> nl. */
export function detectTextLanguage(text: string): "nl" | "en" {
  const t = (text || "").toLowerCase();
  const nl = (t.match(NL_MARKERS) || []).length;
  const en = (t.match(EN_MARKERS) || []).length;
  return en > nl ? "en" : "nl";
}

/** Full classification of a raw job. */
export function classify(raw: RawJob): Classification {
  const title = raw.title || "";
  const descText = raw.descriptionText || stripHtml(raw.descriptionHtml || "");
  const text = `${title}\n${descText}`;
  const tLower = norm(title);

  const cat = detectCategory(title);
  const excluded = hasKeyword(tLower, HARD_EXCLUDE_KEYWORDS);

  let category: CategorySlug;
  let gtmRelevant: boolean;
  if (cat) {
    category = cat;
    gtmRelevant = true;
  } else if (!excluded && hasKeyword(tLower, TECH_SIGNAL_KEYWORDS)) {
    // Gate on the TITLE (not the description): real technical roles signal it in the
    // title. Scanning descriptions lets office/IT/commercial roles leak in.
    category = "overig-techniek";
    gtmRelevant = true;
  } else {
    category = "overig-techniek";
    gtmRelevant = false;
  }

  // salary: prefer structured comp from source (Ashby), else parse text
  let salary: ParsedSalary;
  const c = raw.compensation;
  if (c && (c.min != null || c.max != null)) {
    salary = {
      min: c.min ?? null,
      max: c.max ?? (c.min ? null : null),
      currency: (c.currency || "EUR").toUpperCase(),
      interval: c.interval || "year",
      disclosed: true,
    };
  } else {
    salary = parseSalary(text);
  }

  return {
    category,
    gtmRelevant,
    seniority: detectSeniority(title),
    workMode: detectWorkMode(raw.locationRaw, text),
    location: detectLocation(raw.locationRaw, text),
    salary,
    tools: [],
    aiRequired: detectAI(title, text),
    reportsTo: detectReportsTo(descText),
    compStructure: detectComp(text, salary.disclosed),
    equityType: detectEquity(text),
    // No description text -> assume a Dutch role (a title alone isn't enough signal to call it English).
    lang: descText.trim() ? detectTextLanguage(text) : "nl",
  };
}

/** Minimal HTML -> text (no deps; good enough for classification + previews). */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
