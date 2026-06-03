// Sanity check after a scrape: list the highest salaries with the source text that
// produced them, so a stray number (headcount, 401k, quota, ARR) is easy to spot.
//   npm run salary-audit          # top 20 (by normalised annual EUR)
//   npm run salary-audit -- 40    # top 40
import { getDb } from "../lib/db";
import { formatSalaryRange } from "../lib/format";

const N = Math.max(1, Number(process.argv[2]) || 20);
const HIGH_EUR = 250000; // above this, worth an eyeball (legit AE/leadership OTE can reach ~180k)

const db = getDb();
const rows = db
  .prepare(
    `SELECT j.title, c.name AS company, j.salary_min, j.salary_max, j.salary_currency,
            j.salary_interval, j.salary_max_eur, j.description_text AS d
     FROM jobs j JOIN companies c ON c.id = j.company_id
     WHERE j.status='active' AND j.salary_disclosed=1
     ORDER BY j.salary_max_eur DESC, j.salary_min_eur DESC LIMIT ?`,
  )
  .all(N) as Array<{
    title: string; company: string; salary_min: number | null; salary_max: number | null;
    salary_currency: string; salary_interval: string; salary_max_eur: number | null; d: string | null;
  }>;

const tokenRe = /(?:€|eur|\$|usd|£|gbp)\s?\d[\d.,]*\s?k?|\d{1,3}(?:[.,]\d{3})+|\d{2,3}\s?k\b/gi;

const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
console.log(`\n💶 Salaris-audit — ${stamp} UTC — top ${rows.length} (gesorteerd op jaarbedrag in EUR)`);
console.log(`   ⚠ = boven €${HIGH_EUR / 1000}k/jr; controleer de bron-tekst hieronder.\n`);
let flagged = 0;
for (const r of rows) {
  const eur = r.salary_max_eur ?? 0;
  const flag = eur > HIGH_EUR ? "⚠" : " ";
  if (eur > HIGH_EUR) flagged++;
  const range = formatSalaryRange(r.salary_min, r.salary_max, r.salary_currency, r.salary_interval);
  console.log(`${flag} ${`€${Math.round(eur / 1000)}k/jr`.padEnd(9)} ${range.padEnd(26)} ${r.title.slice(0, 46)} — ${r.company}`);
  const text = `${r.title}\n${r.d || ""}`;
  const seen = new Set<string>();
  const ctxs: string[] = [];
  for (const m of text.matchAll(tokenRe)) {
    const tok = m[0].replace(/\s+/g, "");
    if (seen.has(tok)) continue;
    seen.add(tok);
    const i = m.index ?? 0;
    ctxs.push(text.slice(Math.max(0, i - 20), i + m[0].length + 12).replace(/\s+/g, " ").trim());
    if (ctxs.length >= 4) break;
  }
  if (ctxs.length) console.log(`    ↳ ${ctxs.map((c) => `"${c}"`).join("  ·  ")}`);
}
console.log(`\n${flagged} boven €${HIGH_EUR / 1000}k/jr gemarkeerd.\n`);
