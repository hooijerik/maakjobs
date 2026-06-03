// Indeed NL (best-effort).
//
// CAVEAT: Indeed actively blocks automated access and its ToS restricts scraping.
// This adapter makes a single polite request and parses embedded job-card JSON or
// JSON-LD if present; it degrades to [] otherwise. Do NOT run this at high volume.
// For production, use the Indeed Publisher/Employer APIs instead.
import { fetchText } from "../http";
import { BROWSER_HEADERS, parseJsonLdJobs } from "./jsonld";
import type { RawJob } from "../../../lib/types";

export async function fetchJobs(query: string): Promise<RawJob[]> {
  try {
    const url = `https://nl.indeed.com/jobs?q=${encodeURIComponent(query)}&l=Nederland&fromage=14&sort=date`;
    const html = await fetchText(url, { headers: BROWSER_HEADERS, timeout: 20000 });

    // Preferred: embedded mosaic job-cards model.
    const m = html.match(
      /mosaic-provider-jobcards"\]\s*=\s*(\{[\s\S]*?\});\s*window\.mosaic/,
    );
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const results: any[] =
          data?.metaData?.mosaicProviderJobCardsModel?.results ?? data?.results ?? [];
        const jobs = results
          .map((r) => ({
            source: "indeed" as const,
            sourceId: String(r.jobkey ?? r.jk ?? ""),
            companyName: r.company || "Onbekend",
            title: String(r.title ?? r.displayTitle ?? "").trim(),
            url: `https://nl.indeed.com/viewjob?jk=${r.jobkey ?? r.jk}`,
            locationRaw: r.formattedLocation || r.jobLocationCity,
            descriptionText: (r.snippet || "").replace(/<[^>]+>/g, " ").trim() || undefined,
          }))
          .filter((j) => j.sourceId && j.title);
        if (jobs.length) return jobs;
      } catch {
        /* fall through to JSON-LD */
      }
    }
    return parseJsonLdJobs(html, "indeed");
  } catch {
    return [];
  }
}
