// Greenhouse public board API. Reliable, returns full HTML content.
// https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
import { decodeEntities, fetchJson, toIso } from "../http";
import { stripHtml } from "../../../lib/classify";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  const data = await fetchJson<any>(
    `https://boards-api.greenhouse.io/v1/boards/${c.atsSlug}/jobs?content=true`,
  );
  const jobs: any[] = data?.jobs ?? [];
  return jobs.map((j) => {
    const html = j.content ? decodeEntities(String(j.content)) : undefined;
    return {
      source: "greenhouse",
      sourceId: String(j.id),
      companyName: c.name,
      companyWebsite: c.website,
      companyHandle: c.atsSlug,
      title: String(j.title ?? "").trim(),
      url: j.absolute_url,
      locationRaw: j.location?.name,
      department: j.departments?.[0]?.name,
      descriptionHtml: html,
      descriptionText: html ? stripHtml(html) : undefined,
      postedAt: toIso(j.updated_at) ?? toIso(j.first_published),
    } as RawJob;
  });
}
