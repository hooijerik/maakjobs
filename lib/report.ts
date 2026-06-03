// Salary report aggregation - computed from disclosed, EUR-annualized salaries.

import { getDb } from "./db";
import { categoryLabel, seniorityLabel, workModeLabel, SENIORITY } from "./taxonomy";
import { DEFAULT_LOCALE, type Locale } from "./i18n/config";

interface SalRow {
  min: number;
  max: number;
  category: string;
  seniority: string | null;
  work_mode: string | null;
  province: string | null;
  ai: number;
}

export interface RangeStat {
  key: string;
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface Slice {
  label: string;
  count: number;
  pct: number;
}

export interface SalaryReport {
  totalActive: number;
  disclosed: number;
  disclosureRate: number;
  overall: { min: number; max: number } | null;
  byCategory: RangeStat[];
  bySeniority: RangeStat[];
  byWorkMode: RangeStat[];
  byProvince: RangeStat[];
  scaleMax: number;
  aiPremium: { withAI: RangeStat | null; withoutAI: RangeStat | null; pct: number | null };
  compStructure: Slice[];
  equity: Slice[];
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
const mid = (r: { min: number; max: number }) => (r.min + r.max) / 2;

function rangeBy(
  rows: SalRow[],
  keyOf: (r: SalRow) => string | null,
  labelOf: (k: string) => string,
  minCount = 2,
): RangeStat[] {
  const groups = new Map<string, { mins: number[]; maxs: number[] }>();
  for (const r of rows) {
    const k = keyOf(r);
    if (!k) continue;
    const g = groups.get(k) ?? { mins: [], maxs: [] };
    g.mins.push(r.min);
    g.maxs.push(r.max);
    groups.set(k, g);
  }
  const out: RangeStat[] = [];
  for (const [k, g] of groups) {
    if (g.mins.length < minCount) continue;
    out.push({
      key: k,
      label: labelOf(k),
      min: Math.round(median(g.mins)),
      max: Math.round(median(g.maxs)),
      count: g.mins.length,
    });
  }
  return out;
}

function slices(rows: { label: string; count: number }[]): Slice[] {
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return rows
    .map((r) => ({ label: r.label, count: r.count, pct: Math.round((r.count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

const COMP_LABELS: Record<string, string> = {
  base: "Basis",
  "base+bonus": "Basis + bonus",
  "base+commission": "Basis + commissie",
  ote: "OTE",
};
const EQUITY_LABELS: Record<string, string> = {
  options: "Aandelenopties",
  rsu: "RSU's",
  equity: "Equity",
};

export function buildSalaryReport(locale: Locale = DEFAULT_LOCALE): SalaryReport {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT salary_min_eur AS min, salary_max_eur AS max, category, seniority, work_mode, province, ai_required AS ai
       FROM jobs WHERE status='active' AND salary_disclosed=1 AND salary_min_eur IS NOT NULL AND salary_max_eur IS NOT NULL`,
    )
    .all() as unknown as SalRow[];

  const totalActive = (db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE status='active'").get() as { n: number }).n;
  const disclosed = rows.length;

  const seniorityOrder = new Map<string, number>(SENIORITY.map((s, i) => [s.slug, i]));

  const byCategory = rangeBy(rows, (r) => r.category, (k) => categoryLabel(k, locale)).sort(
    (a, b) => b.max - a.max,
  );
  const bySeniority = rangeBy(rows, (r) => r.seniority, (k) => seniorityLabel(k, locale)).sort(
    (a, b) => (seniorityOrder.get(a.key) ?? 0) - (seniorityOrder.get(b.key) ?? 0),
  );
  const byWorkMode = rangeBy(rows, (r) => r.work_mode, (k) => workModeLabel(k, locale)).sort(
    (a, b) => b.max - a.max,
  );
  const byProvince = rangeBy(rows, (r) => r.province, (k) => k).sort((a, b) => b.max - a.max);

  const overall =
    rows.length > 0
      ? { min: Math.round(median(rows.map((r) => r.min))), max: Math.round(median(rows.map((r) => r.max))) }
      : null;

  const scaleMax = Math.max(
    overall?.max ?? 0,
    ...byCategory.map((r) => r.max),
    ...bySeniority.map((r) => r.max),
    1,
  );

  const aiRows = rangeBy(rows, (r) => (r.ai ? "ai" : "noai"), (k) => k, 2);
  const withAI = aiRows.find((r) => r.key === "ai") ?? null;
  const withoutAI = aiRows.find((r) => r.key === "noai") ?? null;
  const pct =
    withAI && withoutAI && mid(withoutAI) > 0
      ? Math.round(((mid(withAI) - mid(withoutAI)) / mid(withoutAI)) * 100)
      : null;

  const compRows = db
    .prepare(
      "SELECT comp_structure AS k, COUNT(*) AS count FROM jobs WHERE status='active' AND comp_structure IS NOT NULL GROUP BY comp_structure",
    )
    .all() as unknown as { k: string; count: number }[];
  const equityRows = db
    .prepare(
      "SELECT equity_type AS k, COUNT(*) AS count FROM jobs WHERE status='active' AND equity_type IS NOT NULL GROUP BY equity_type",
    )
    .all() as unknown as { k: string; count: number }[];

  return {
    totalActive,
    disclosed,
    disclosureRate: totalActive ? Math.round((disclosed / totalActive) * 100) : 0,
    overall,
    byCategory,
    bySeniority,
    byWorkMode,
    byProvince,
    scaleMax,
    aiPremium: { withAI, withoutAI, pct },
    compStructure: slices(
      compRows.map((r) => ({ label: COMP_LABELS[r.k] || r.k, count: r.count })),
    ),
    equity: slices(
      equityRows.map((r) => ({ label: EQUITY_LABELS[r.k] || r.k, count: r.count })),
    ),
  };
}
