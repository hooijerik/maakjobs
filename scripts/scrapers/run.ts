// Scraper orchestrator: fetch -> classify -> dedup/upsert -> expire stale -> report.
//
// Usage:
//   npm run scrape                 # all ATS companies + aggregators (best-effort)
//   npm run scrape -- --ats-only   # skip the fragile aggregator adapters
//   npm run scrape -- greenhouse   # only the named source(s)
//   npm run scrape -- aggregators  # only the aggregators
import { readFileSync } from "node:fs";
import path from "node:path";

import * as greenhouse from "./ats/greenhouse";
import * as lever from "./ats/lever";
import * as ashby from "./ats/ashby";
import * as recruitee from "./ats/recruitee";
import * as workable from "./ats/workable";
import * as smartrecruiters from "./ats/smartrecruiters";
import * as personio from "./ats/personio";
import * as homerun from "./ats/homerun";
import * as indeed from "./aggregators/indeed";
import * as nvb from "./aggregators/nationalevacaturebank";
import * as magnet from "./aggregators/magnet";
import * as linkedin from "./aggregators/linkedin";

import { sleep } from "./http";
import {
  expireCompanyJobs,
  recordRun,
  runStartStamp,
  upsertCompany,
  upsertJob,
  type UpsertResult,
} from "./store";
import { getStats, getFacets } from "../../lib/queries";
import { categoryLabel } from "../../lib/taxonomy";
import type { AtsType, RawJob, SeedCompany } from "../../lib/types";

const ATS: Record<AtsType, { fetchJobs: (c: SeedCompany) => Promise<RawJob[]> }> = {
  greenhouse,
  lever,
  ashby,
  recruitee,
  workable,
  smartrecruiters,
  personio,
  homerun,
};

const AGGREGATORS: Record<string, { fetchJobs: (q: string) => Promise<RawJob[]> }> = {
  indeed,
  linkedin,
  nationalevacaturebank: nvb,
  magnet,
};

const AGG_QUERIES = [
  "monteur",
  "technicus",
  "installateur",
  "elektromonteur",
  "onderhoudsmonteur",
  "servicemonteur",
  "werktuigbouwkundige",
  "lasser",
  "mechatronica",
  "werkvoorbereider",
  "cnc",
  "procesoperator",
];

interface Tally {
  found: number;
  inserted: number;
  updated: number;
  unchanged: number;
  skipped: number;
}
const zero = (): Tally => ({ found: 0, inserted: 0, updated: 0, unchanged: 0, skipped: 0 });
function tallyAdd(t: Tally, r: UpsertResult) {
  if (r === "inserted") t.inserted++;
  else if (r === "updated") t.updated++;
  else if (r === "unchanged") t.unchanged++;
  else t.skipped++;
}

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

function loadSeed(): SeedCompany[] {
  const p = path.join(import.meta.dirname, "seed", "companies.json");
  return JSON.parse(readFileSync(p, "utf8")) as SeedCompany[];
}

async function main() {
  const args = process.argv.slice(2);
  const atsOnly = args.includes("--ats-only");
  const only = args.filter((a) => !a.startsWith("--"));
  const runStart = runStartStamp();

  console.log(`\n🔎 maakjobs scraper - start ${runStart} UTC\n`);

  // ---- ATS sources ----
  let seed = loadSeed();
  if (only.length) seed = seed.filter((c) => only.includes(c.atsType));
  const bySource = new Map<string, Tally>();
  const emptyCompanies: string[] = [];

  await mapLimit(seed, 6, async (c) => {
    const adapter = ATS[c.atsType];
    if (!adapter) return;
    const t = bySource.get(c.atsType) ?? zero();
    bySource.set(c.atsType, t);
    try {
      const jobs = await adapter.fetchJobs(c);
      t.found += jobs.length;
      const companyId = upsertCompany(c.name, {
        website: c.website,
        atsType: c.atsType,
        atsSlug: c.atsSlug,
      });
      const before = { ins: t.inserted, upd: t.updated };
      for (const raw of jobs) tallyAdd(t, upsertJob(raw));
      const expired = expireCompanyJobs(c.atsType, companyId, runStart);
      const added = t.inserted - before.ins;
      const upd = t.updated - before.upd;
      console.log(
        `  ${c.name.padEnd(16)} ${("[" + c.atsType + "]").padEnd(18)} ${String(jobs.length).padStart(4)} found  → +${added} ~${upd}  expired ${expired}`,
      );
      if (jobs.length === 0) emptyCompanies.push(`${c.name} (${c.atsType}/${c.atsSlug})`);
    } catch (e) {
      console.log(`  ${c.name.padEnd(16)} [${c.atsType}]  ✗ ${(e as Error).message}`);
      emptyCompanies.push(`${c.name} (${c.atsType}/${c.atsSlug}) - error`);
    }
  });

  for (const [src, t] of bySource) {
    recordRun(src, runStart, t.found, t.inserted, t.updated, []);
  }

  // ---- Aggregators (best-effort) ----
  if (!atsOnly && (only.length === 0 || only.includes("aggregators"))) {
    console.log(`\n  Aggregators (best-effort - see ToS caveats in each adapter):`);
    for (const [name, adapter] of Object.entries(AGGREGATORS)) {
      const t = zero();
      const errs: string[] = [];
      for (const q of AGG_QUERIES) {
        try {
          const jobs = await adapter.fetchJobs(q);
          t.found += jobs.length;
          for (const raw of jobs) tallyAdd(t, upsertJob(raw));
        } catch (e) {
          errs.push(`${q}: ${(e as Error).message}`);
        }
        await sleep(1500);
      }
      recordRun(name, runStart, t.found, t.inserted, t.updated, errs);
      console.log(
        `  ${name.padEnd(24)} ${String(t.found).padStart(4)} found  → +${t.inserted} ~${t.updated}`,
      );
    }
  }

  // ---- Summary ----
  const stats = getStats();
  const facets = getFacets();
  console.log(`\n──────────── Resultaat ────────────`);
  console.log(`  Actieve vacatures : ${stats.activeJobs}`);
  console.log(`  Nieuw (7 dagen)   : ${stats.newThisWeek}`);
  console.log(`  Bedrijven         : ${stats.companies}`);
  console.log(`\n  Per categorie:`);
  for (const f of facets.categories) {
    console.log(`    ${categoryLabel(f.key).padEnd(18)} ${f.count}`);
  }
  if (emptyCompanies.length) {
    console.log(`\n  ⚠ Geen vacatures (controleer ATS-slug):`);
    for (const c of emptyCompanies) console.log(`    - ${c}`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
