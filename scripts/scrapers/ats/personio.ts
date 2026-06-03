// Personio XML feed (best-effort). Common with NL/DE employers.
// https://{slug}.jobs.personio.com/xml  (or .de)
import * as cheerio from "cheerio";
import { fetchText, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  let xml = "";
  for (const tld of ["com", "de"]) {
    try {
      xml = await fetchText(`https://${c.atsSlug}.jobs.personio.${tld}/xml`);
      if (xml.includes("<position")) break;
    } catch {
      /* try next */
    }
  }
  if (!xml.includes("<position")) return [];

  const $ = cheerio.load(xml, { xmlMode: true });
  const out: RawJob[] = [];
  $("position").each((_, el) => {
    const $e = $(el);
    const id = $e.find("id").first().text().trim();
    if (!id) return;
    const descParts: string[] = [];
    $e.find("jobDescriptions jobDescription").each((__, d) => {
      descParts.push($(d).find("name").text(), $(d).find("value").text());
    });
    out.push({
      source: "personio",
      sourceId: id,
      companyName: c.name,
      companyWebsite: c.website,
      companyHandle: c.atsSlug,
      title: $e.find("name").first().text().trim(),
      url: `https://${c.atsSlug}.jobs.personio.com/job/${id}`,
      locationRaw: $e.find("office").first().text().trim() || undefined,
      department: $e.find("department").first().text().trim() || undefined,
      employmentType: $e.find("employmentType").first().text().trim() || undefined,
      descriptionHtml: descParts.join(" ") || undefined,
      postedAt: toIso($e.find("createdAt").first().text().trim()),
    });
  });
  return out;
}
