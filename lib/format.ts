// Pure formatting/slug helpers - safe in both server and client components.

import type { SalaryInterval } from "./types";
import type { Locale } from "./i18n/config";

export function slugify(input: string): string {
  const s = (input || "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " en ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "x";
}

const nlNumber = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });
const enNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Locale-aware integer formatting. */
export function formatNumber(n: number, _locale: Locale = "nl"): string {
  return nlNumber.format(n);
}

function currencySymbol(currency: string | null): string {
  if (currency === "USD") return "$";
  if (currency === "GBP") return "£";
  return "€";
}

/** Human salary range, e.g. "€ 60.000 – € 80.000" or "€ 4.000 – € 5.500 p/mnd". */
export function formatSalaryRange(
  min: number | null,
  max: number | null,
  currency: string | null,
  interval: SalaryInterval | null,
  _locale: Locale = "nl",
): string | null {
  if (min == null && max == null) return null;
  const sym = currencySymbol(currency);
  const fmt = (n: number) => `${sym} ${nlNumber.format(Math.round(n))}`;
  const suffix = interval === "month" ? " p/mnd" : interval === "hour" ? " p/uur" : "";
  if (min != null && max != null && Math.round(min) !== Math.round(max)) {
    return `${fmt(min)} – ${fmt(max)}${suffix}`;
  }
  return `${fmt((min ?? max) as number)}${suffix}`;
}

/** Convert a salary figure to an approximate annual EUR amount (for aggregation). */
export function toAnnualEUR(
  value: number,
  currency: string | null,
  interval: SalaryInterval | null,
): number {
  const usdRate = Number(process.env.SALARY_USD_EUR_RATE) || 0.92;
  let v = value;
  if (interval === "month") v *= 12;
  else if (interval === "hour") v *= 2080; // 40h * 52w
  if (currency === "USD") v *= usdRate;
  else if (currency === "GBP") v *= usdRate * 1.17;
  return v;
}

/** Short EUR label like "€ 72k". */
export function formatEURShort(value: number | null): string {
  if (value == null) return "-";
  if (value >= 1000) return `€ ${Math.round(value / 1000)}k`;
  return `€ ${Math.round(value)}`;
}

export function pluralNL(n: number, singular: string, plural: string): string {
  return `${nlNumber.format(n)} ${n === 1 ? singular : plural}`;
}

/** Relative time, locale-aware ("3 uur geleden" / "3h ago"). */
export function timeAgo(iso: string | null, _locale: Locale = "nl"): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const min = Math.floor((Date.now() - then) / 60000);
  const en = false;
  if (min < 1) return en ? "just now" : "zojuist";
  if (min < 60) return en ? `${min} min ago` : `${min} min geleden`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return en ? `${hr}h ago` : `${hr} uur geleden`;
  const days = Math.floor(hr / 24);
  if (days === 1) return en ? "yesterday" : "gisteren";
  if (days < 7) return en ? `${days} days ago` : `${days} dagen geleden`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return en ? `${weeks}w ago` : `${weeks} ${weeks === 1 ? "week" : "weken"} geleden`;
  const months = Math.floor(days / 30);
  if (months < 12) return en ? `${months}mo ago` : `${months} ${months === 1 ? "maand" : "maanden"} geleden`;
  const years = Math.floor(days / 365);
  return en ? `${years}y ago` : `${years} jaar geleden`;
}

const nlDate = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateNL(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return nlDate.format(d);
}

const enDate = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

/** Locale-aware short date. */
export function formatDate(iso: string | null, _locale: Locale = "nl"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return nlDate.format(d);
}

export function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Lightweight sanitizer for third-party ATS description HTML (no deps). */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<\/?(script|style|iframe|object|embed|link|meta|form|input)[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

