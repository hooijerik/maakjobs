// Magnet.me (best-effort).
//
// CAVEAT: Magnet.me's job data is served via an authenticated GraphQL API, so
// anonymous scraping yields little. This adapter reads any public JSON-LD on the
// search page and otherwise returns []. Prefer an official integration; review ToS.
import { fetchText } from "../http";
import { BROWSER_HEADERS, parseJsonLdJobs } from "./jsonld";
import type { RawJob } from "../../../lib/types";

export async function fetchJobs(query: string): Promise<RawJob[]> {
  try {
    const url = `https://magnet.me/search/jobs?q=${encodeURIComponent(query)}&country=NL`;
    const html = await fetchText(url, { headers: BROWSER_HEADERS, timeout: 20000 });
    return parseJsonLdJobs(html, "magnet");
  } catch {
    return [];
  }
}
