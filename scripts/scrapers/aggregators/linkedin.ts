// LinkedIn (best-effort, PUBLIC guest endpoint).
//
// CAVEAT: Scraping LinkedIn violates LinkedIn's User Agreement and is aggressively
// rate-limited / blocked. This adapter only calls the PUBLIC, unauthenticated
// "jobs-guest" search endpoint (no login, no credentials, no auth bypass), paginates
// politely with delays, and degrades to whatever it collected on any failure. Do NOT
// run it at high volume. For production, use LinkedIn's official Job Posting API /
// Talent Solutions or a licensed data provider, and review the Terms of Service.
import * as cheerio from "cheerio";
import { fetchText, sleep, toIso } from "../http";
import { BROWSER_HEADERS } from "./jsonld";
import type { RawJob } from "../../../lib/types";

const MAX_PAGES = 3; // ~25 cards per page
const PAGE_DELAY_MS = 1200;

function jobIdFromUrl(url: string): string | null {
  const m = url.match(/-(\d{7,})(?:[/?]|$)/) || url.match(/(\d{7,})/);
  return m ? m[1] : null;
}

export async function fetchJobs(query: string): Promise<RawJob[]> {
  const out: RawJob[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < MAX_PAGES; page++) {
    let html: string;
    try {
      const url =
        `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search` +
        `?keywords=${encodeURIComponent(query)}&location=Netherlands&f_TPR=r604800&start=${page * 25}`;
      html = await fetchText(url, { headers: BROWSER_HEADERS, timeout: 20000 });
    } catch {
      break; // blocked / rate-limited - keep what we have
    }

    const $ = cheerio.load(html);
    const before = out.length;

    $("li").each((_, li) => {
      const $li = $(li);
      const title = $li.find(".base-search-card__title").text().trim();
      const company = $li.find(".base-search-card__subtitle").text().trim();
      const location = $li.find(".job-search-card__location").text().trim();
      const href = (
        $li.find("a.base-card__full-link").attr("href") ||
        $li.find("a").attr("href") ||
        ""
      ).split("?")[0];
      if (!title || !href) return;
      const id = jobIdFromUrl(href) || href;
      if (seen.has(id)) return;
      seen.add(id);
      out.push({
        source: "linkedin",
        sourceId: id,
        companyName: company || "Onbekend",
        title,
        url: href,
        locationRaw: location || "Netherlands",
        postedAt: toIso($li.find("time").attr("datetime")),
      });
    });

    if (out.length === before) break; // no new cards -> end of results / blocked
    if (page < MAX_PAGES - 1) await sleep(PAGE_DELAY_MS);
  }

  return out;
}
