// Re-evaluate already-stored jobs against the CURRENT classifier rules WITHOUT
// re-fetching (so intermittent LinkedIn/Indeed data is preserved):
//   - expires jobs that are no longer technically relevant or not doable from the Netherlands
//   - re-normalises kept jobs (category, seniority, work mode, salary, tools, …)
// Run: npm run reclassify
import { getDb } from "../lib/db";
import { classify } from "../lib/classify";
import { slugify, toAnnualEUR } from "../lib/format";
import type { RawJob } from "../lib/types";

interface Row {
  id: number;
  source: string;
  source_id: string;
  title: string;
  location_raw: string | null;
  description_text: string | null;
  comp: string;
}

const db = getDb();
const rows = db
  .prepare(
    `SELECT j.id, j.source, j.source_id, j.title, j.location_raw, j.description_text, c.name AS comp
     FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.status='active'`,
  )
  .all() as unknown as Row[];

const expireStmt = db.prepare("UPDATE jobs SET status='expired' WHERE id = ?");
const updateStmt = db.prepare(
  `UPDATE jobs SET category=?, seniority=?, work_mode=?, city=?, city_slug=?, province=?, country=?,
     salary_min=?, salary_max=?, salary_currency=?, salary_interval=?, salary_min_eur=?, salary_max_eur=?,
     salary_disclosed=?, comp_structure=?, equity_type=?, tools_json=?, ai_required=?, reports_to=?, lang=?
   WHERE id=?`,
);

let kept = 0;
let expiredNonNl = 0;
let expiredNonGtm = 0;

for (const r of rows) {
  const raw: RawJob = {
    source: r.source as RawJob["source"],
    sourceId: r.source_id,
    companyName: r.comp,
    title: r.title,
    url: "#",
    locationRaw: r.location_raw ?? undefined,
    descriptionText: r.description_text ?? undefined,
  };
  const cls = classify(raw);
  if (!cls.gtmRelevant) {
    expireStmt.run(r.id);
    expiredNonGtm++;
    continue;
  }
  if (!cls.location.nlRelevant) {
    expireStmt.run(r.id);
    expiredNonNl++;
    continue;
  }
  kept++;
  const s = cls.salary;
  const minEur = s.min != null ? Math.round(toAnnualEUR(s.min, s.currency, s.interval)) : null;
  const maxEur = s.max != null ? Math.round(toAnnualEUR(s.max, s.currency, s.interval)) : minEur;
  updateStmt.run(
    cls.category,
    cls.seniority,
    cls.workMode,
    cls.location.city,
    cls.location.city ? slugify(cls.location.city) : null,
    cls.location.province,
    cls.location.country,
    s.min,
    s.max,
    s.currency,
    s.interval,
    minEur,
    maxEur,
    s.disclosed ? 1 : 0,
    cls.compStructure,
    cls.equityType,
    JSON.stringify(cls.tools),
    cls.aiRequired ? 1 : 0,
    cls.reportsTo,
    cls.lang,
    r.id,
  );
}

const active = (db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE status='active'").get() as { n: number }).n;
console.log("Herclassificatie klaar:");
console.log(`  Behouden/bijgewerkt    : ${kept}`);
console.log(`  Verlopen (niet NL)     : ${expiredNonNl}`);
console.log(`  Verlopen (niet technisch)    : ${expiredNonGtm}`);
console.log(`  Actief nu              : ${active}`);
