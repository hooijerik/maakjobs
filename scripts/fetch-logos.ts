// Resolve real company logos via Google's favicon service and store verified URLs.
// Google returns a generic ~726-byte globe for unknown domains, so we fingerprint
// that globe (multiple probes + retry) and only keep favicons that differ from it.
// Companies without a resolvable logo keep logo_url = null (initials avatar).
// Run: npm run fetch-logos
import crypto from "node:crypto";
import { getDb } from "../lib/db";
import { slugify } from "../lib/format";

const sz = 128;
const faviconUrl = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=${sz}`;

function domainOf(website: string | null): string | null {
  if (!website) return null;
  try {
    return new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

interface Fav {
  hash: string;
  size: number;
}

async function fav(domain: string, retries = 1): Promise<Fav | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(faviconUrl(domain));
      if (!r.ok) return null;
      const b = Buffer.from(await r.arrayBuffer());
      if (b.byteLength < 100) return null;
      return { hash: crypto.createHash("md5").update(b).digest("hex"), size: b.byteLength };
    } catch {
      // transient - retry
    }
  }
  return null;
}

/** Fingerprint the placeholder globe from several guaranteed-nonexistent domains. */
async function determineGlobe(): Promise<string | null> {
  const probes = [
    "no-such-domain-aaa111zzz.com",
    "definitely-not-real-bbb222.io",
    "qqqwww-nope-333abc.nl",
  ];
  const counts = new Map<string, number>();
  for (const p of probes) {
    const f = await fav(p);
    if (f) counts.set(f.hash, (counts.get(f.hash) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [h, n] of counts) if (n > bestN) ((best = h), (bestN = n));
  return best;
}

/** Social/aggregator favicons that brand-name guessing sometimes lands on (e.g. a parked
 *  impress.com that serves LinkedIn's icon). Fingerprinted once, then rejected. */
async function determineDecoys(): Promise<Set<string>> {
  const domains = ["linkedin.com", "facebook.com", "instagram.com", "x.com", "twitter.com", "indeed.com", "youtube.com"];
  const set = new Set<string>();
  for (const d of domains) {
    const f = await fav(d);
    if (f) set.add(f.hash);
  }
  return set;
}

function isReal(f: Fav | null, globe: string | null, decoys: Set<string>): boolean {
  if (!f) return false;
  if (decoys.has(f.hash)) return false; // a parked/redirected domain serving a social-network icon
  if (globe) return f.hash !== globe;
  return f.size < 700 || f.size > 760; // fallback: ~726B is the globe
}

interface CompanyRow {
  id: number;
  name: string;
  website: string | null;
}

async function main() {
  const db = getDb();
  const globe = await determineGlobe();
  const decoys = await determineDecoys();
  console.log(globe ? `Globe-signature: ${globe.slice(0, 10)}…` : "Globe onbekend - val terug op grootte-heuristiek.");
  console.log(`Decoy-signatures (LinkedIn e.d.): ${decoys.size}`);

  const companies = db.prepare("SELECT id, name, website FROM companies").all() as unknown as CompanyRow[];
  const update = db.prepare("UPDATE companies SET logo_url = ? WHERE id = ?");

  let withLogo = 0;
  let without = 0;
  let idx = 0;

  async function worker() {
    while (idx < companies.length) {
      const c = companies[idx++];
      const domains: string[] = [];
      const w = domainOf(c.website);
      if (w) {
        domains.push(w);
      } else {
        const brand = String(c.name).split(/[-\u2013\u2014|,(/:]/)[0].trim();
        const base = slugify(brand).replace(/-/g, "");
        if (base.length >= 2) for (const tld of ["com", "io", "nl"]) domains.push(`${base}.${tld}`);
      }
      let found: string | null = null;
      for (const d of domains) {
        if (isReal(await fav(d), globe, decoys)) {
          found = faviconUrl(d);
          break;
        }
      }
      update.run(found, c.id);
      if (found) withLogo++;
      else without++;
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => worker()));
  console.log(`Logo's: ${withLogo} gevonden, ${without} zonder (tonen initialen).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
