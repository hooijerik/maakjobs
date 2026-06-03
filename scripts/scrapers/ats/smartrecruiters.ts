// SmartRecruiters public postings API (list only; descriptions omitted to avoid N+1).
// https://api.smartrecruiters.com/v1/companies/{slug}/postings
import { fetchJson, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  try {
    const data = await fetchJson<any>(
      `https://api.smartrecruiters.com/v1/companies/${c.atsSlug}/postings?limit=100`,
    );
    const content: any[] = data?.content ?? [];
    return content.map((p) => {
      const loc =
        [p.location?.city, p.location?.region, p.location?.country].filter(Boolean).join(", ") +
        (p.location?.remote ? ", Remote" : "");
      return {
        source: "smartrecruiters",
        sourceId: String(p.id),
        companyName: c.name,
        companyWebsite: c.website,
        companyHandle: c.atsSlug,
        title: String(p.name ?? "").trim(),
        url: p.ref || `https://jobs.smartrecruiters.com/${c.atsSlug}/${p.id}`,
        locationRaw: loc || undefined,
        department: p.department?.label,
        postedAt: toIso(p.releasedDate),
      } as RawJob;
    });
  } catch {
    return [];
  }
}
