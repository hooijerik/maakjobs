// Nationale Vacaturebank (best-effort).
//
// CAVEAT: Scraping aggregator HTML is fragile (layout/anti-bot changes) and may
// conflict with the site's Terms of Service. This adapter only reads public
// JSON-LD JobPosting data and degrades to [] on any failure. For production use,
// prefer an official API/partnership and review the site's ToS + robots.txt.
import { fetchText } from "../http";
import { BROWSER_HEADERS, parseJsonLdJobs } from "./jsonld";
import type { RawJob } from "../../../lib/types";

export async function fetchJobs(query: string): Promise<RawJob[]> {
  try {
    const url = `https://www.nationalevacaturebank.nl/vacature/zoeken?query=${encodeURIComponent(query)}`;
    const html = await fetchText(url, { headers: BROWSER_HEADERS, timeout: 20000 });
    return parseJsonLdJobs(html, "nationalevacaturebank");
  } catch {
    return [];
  }
}
