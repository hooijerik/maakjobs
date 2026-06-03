// Homerun (Dutch ATS) - best-effort public JSON. Returns [] if unavailable.
import { fetchJson, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  for (const url of [
    `https://${c.atsSlug}.homerun.co/api/v1/jobs`,
    `https://${c.atsSlug}.homerun.co/jobs.json`,
  ]) {
    try {
      const data = await fetchJson<any>(url);
      const jobs: any[] = Array.isArray(data) ? data : (data?.jobs ?? data?.data ?? []);
      if (!jobs.length) continue;
      return jobs.map((j) => ({
        source: "homerun",
        sourceId: String(j.id ?? j.uuid ?? j.slug),
        companyName: c.name,
        companyWebsite: c.website,
        companyHandle: c.atsSlug,
        title: String(j.title ?? j.name ?? "").trim(),
        url: j.url || j.public_url || `https://${c.atsSlug}.homerun.co/`,
        locationRaw: j.location || j.city,
        descriptionHtml: j.description || j.body,
        postedAt: toIso(j.published_at) ?? toIso(j.created_at),
      })) as RawJob[];
    } catch {
      /* try next url */
    }
  }
  return [];
}
