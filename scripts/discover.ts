// One-off discovery: probe public ATS endpoints for a list of candidate companies and
// merge the ones that actually return jobs into seed/companies.json. Reusable: drop new
// company names into CANDIDATES and re-run.
//
//   npx tsx scripts/discover.ts          # probe + merge newly-found job boards
//   npx tsx scripts/discover.ts --dry    # probe only, write nothing
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import * as greenhouse from "./scrapers/ats/greenhouse";
import * as lever from "./scrapers/ats/lever";
import * as ashby from "./scrapers/ats/ashby";
import * as recruitee from "./scrapers/ats/recruitee";
import * as workable from "./scrapers/ats/workable";
import * as smartrecruiters from "./scrapers/ats/smartrecruiters";
import * as homerun from "./scrapers/ats/homerun";
import { slugify } from "../lib/format";
import type { AtsType, RawJob, SeedCompany } from "../lib/types";

// Order matters only for which hit is reported first; probing stops at the first ATS that answers.
const PROBE: [AtsType, { fetchJobs: (c: SeedCompany) => Promise<RawJob[]> }][] = [
  ["greenhouse", greenhouse],
  ["lever", lever],
  ["ashby", ashby],
  ["recruitee", recruitee],
  ["workable", workable],
  ["smartrecruiters", smartrecruiters],
  ["homerun", homerun],
];

type Candidate = { name: string; slug?: string; website?: string };

// NL technical / maakindustrie employers + technical staffing (detacheerders). The slug defaults
// to the name lowercased without spaces/punctuation; set `slug` explicitly when the tenant differs.
const CANDIDATES: Candidate[] = [
  // ---- Technical staffing / detachering (often Recruitee/Homerun) ----
  { name: "Continu", website: "continu.nl" },
  { name: "Tide", website: "tide.nl" },
  { name: "Maandag", website: "maandag.nl" },
  { name: "Itaq", website: "itaq.nl" },
  { name: "Tense", website: "tense.nl" },
  { name: "Gateway", website: "gateway.eu" },
  { name: "DPA", website: "dpa.nl" },
  { name: "Pieter Bas", slug: "pieterbas", website: "pieterbasdetachering.nl" },
  { name: "JS Consultancy", slug: "jsconsultancy", website: "jsconsultancy.nl" },
  // ---- Installatie / service / klimaat ----
  { name: "Hoppenbrouwers", website: "hoppenbrouwers.nl" },
  { name: "Van Dorp", slug: "vandorp", website: "vandorp.eu" },
  { name: "Kuijpers", website: "kuijpers.nl" },
  { name: "Unica", website: "unica.nl" },
  { name: "Breman", website: "breman.nl" },
  { name: "Hellebrekers", website: "hellebrekers.nl" },
  { name: "Klimaatgroep Holland", slug: "klimaatgroepholland", website: "klimaatgroepholland.nl" },
  { name: "Feenstra", website: "feenstra.com" },
  { name: "Croonwolter&dros", slug: "croonwolterendros", website: "croonwolterendros.nl" },
  // ---- Machinebouw / OEM / hightech ----
  { name: "Vanderlande", website: "vanderlande.com" },
  { name: "Bronkhorst", website: "bronkhorst.com" },
  { name: "NTS Group", slug: "nts-group", website: "nts-group.nl" },
  { name: "Sioux", website: "sioux.eu" },
  { name: "Frencken", website: "frencken.nl" },
  { name: "Voortman", website: "voortman.net" },
  { name: "KMWE", website: "kmwe.com" },
  { name: "Hittech", website: "hittech.com" },
  { name: "Aebi Schmidt", slug: "aebischmidt", website: "aebi-schmidt.com" },
  { name: "Nedschroef", website: "nedschroef.com" },
  { name: "VDL", slug: "vdlgroep", website: "vdlgroep.com" },
  { name: "Marel", website: "marel.com" },
  { name: "Demcon", website: "demcon.com" },
  { name: "Nedap", website: "nedap.com" },
  // ---- More installatie / service / technical services ----
  { name: "Actemium", website: "actemium.nl" },
  { name: "Equans", website: "equans.nl" },
  { name: "Strukton", website: "strukton.com" },
  { name: "Mourik", website: "mourik.com" },
  { name: "Stork", website: "stork.com" },
  { name: "Kropman", website: "kropman.nl" },
  { name: "Homij", website: "homij.nl" },
  { name: "Verkley", website: "verkley.nl" },
  { name: "Lomans", website: "lomans.nl" },
  { name: "Coolmark", website: "coolmark.nl" },
  { name: "Linthorst", slug: "linthorst", website: "linthorst.nl" },
  // ---- More machinebouw / OEM / hightech ----
  { name: "Lely", website: "lely.com" },
  { name: "GEA", website: "gea.com" },
  { name: "IHC", slug: "royalihc", website: "royalihc.com" },
  { name: "Damen", slug: "damen", website: "damen.com" },
  { name: "Norma Groep", slug: "normagroep", website: "norma.nl" },
  { name: "Additive Industries", slug: "additiveindustries", website: "additiveindustries.com" },
  { name: "Settels Savenije", slug: "sst", website: "sst.nl" },
  { name: "Salland Engineering", slug: "sallandengineering", website: "salland.com" },
  { name: "VDL ETG", slug: "vdletg", website: "vdletg.com" },
  // ---- Engineering / consultancy with technical roles ----
  { name: "Royal HaskoningDHV", slug: "royalhaskoningdhv", website: "royalhaskoningdhv.com" },
  { name: "Iv-Groep", slug: "iv-groep", website: "iv-groep.nl" },
  { name: "Movares", website: "movares.nl" },
  { name: "Tauw", website: "tauw.com" },
  { name: "Antea Group", slug: "anteagroup", website: "anteagroup.nl" },
  { name: "Sweco", website: "sweco.nl" },
];

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

interface Hit {
  name: string;
  atsType: AtsType;
  atsSlug: string;
  website?: string;
  jobs: number;
}

async function probe(cand: Candidate): Promise<Hit | null> {
  const slug = (cand.slug ?? slugify(cand.name).replace(/-/g, "")).trim();
  if (!slug) return null;
  for (const [atsType, adapter] of PROBE) {
    try {
      const jobs = await adapter.fetchJobs({ name: cand.name, atsType, atsSlug: slug } as SeedCompany);
      if (jobs && jobs.length > 0) {
        return { name: cand.name, atsType, atsSlug: slug, website: cand.website || undefined, jobs: jobs.length };
      }
    } catch {
      /* not on this ATS (404 / parse error) - try the next */
    }
  }
  return null;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const seedPath = path.join(import.meta.dirname, "scrapers", "seed", "companies.json");
  const seed = JSON.parse(readFileSync(seedPath, "utf8")) as SeedCompany[];
  const haveSlug = new Set(seed.map((c) => `${c.atsType}:${c.atsSlug.toLowerCase()}`));
  const haveName = new Set(seed.map((c) => c.name.toLowerCase()));

  console.log(`\n🔍 Discovery: ${CANDIDATES.length} kandidaten × ${PROBE.length} ATS-platformen\n`);
  const hits: Hit[] = [];
  await mapLimit(CANDIDATES, 6, async (c) => {
    const hit = await probe(c);
    if (hit) {
      hits.push(hit);
      console.log(
        `  ✓ ${hit.name.padEnd(22)} ${("[" + hit.atsType + "]").padEnd(17)} ${hit.atsSlug.padEnd(20)} ${hit.jobs} jobs`,
      );
    }
  });

  const fresh = hits.filter(
    (h) => !haveName.has(h.name.toLowerCase()) && !haveSlug.has(`${h.atsType}:${h.atsSlug.toLowerCase()}`),
  );
  hits.sort((a, b) => b.jobs - a.jobs);
  console.log(`\n  ${hits.length} job boards gevonden, ${fresh.length} nieuw.`);

  writeFileSync(
    path.join(import.meta.dirname, "scrapers", "seed", "discovered.json"),
    JSON.stringify(hits, null, 2) + "\n",
  );

  if (!dry && fresh.length) {
    const merged = seed.concat(
      fresh.map((h) => ({
        name: h.name,
        atsType: h.atsType,
        atsSlug: h.atsSlug,
        ...(h.website ? { website: h.website } : {}),
      })),
    );
    writeFileSync(seedPath, JSON.stringify(merged, null, 2) + "\n");
    console.log(`  → ${fresh.length} toegevoegd aan companies.json (totaal ${merged.length}).`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
