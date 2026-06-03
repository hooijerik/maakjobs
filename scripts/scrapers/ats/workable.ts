// Workable public widget API (best-effort; shape varies by account).
import { fetchJson, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  try {
    const data = await fetchJson<any>(
      `https://apply.workable.com/api/v1/widget/accounts/${c.atsSlug}?details=true`,
    );
    const jobs: any[] = data?.jobs ?? [];
    return jobs.map((j) => {
      const loc =
        j.location?.location_str ||
        [j.city, j.country].filter(Boolean).join(", ") ||
        (j.telecommuting ? "Remote" : undefined);
      return {
        source: "workable",
        sourceId: String(j.shortcode ?? j.id),
        companyName: c.name,
        companyWebsite: c.website,
        companyHandle: c.atsSlug,
        title: String(j.title ?? "").trim(),
        url: j.url || j.shortlink || j.application_url,
        locationRaw: loc,
        department: j.department,
        employmentType: j.employment_type,
        descriptionHtml: j.description,
        postedAt: toIso(j.published_on) ?? toIso(j.created_at),
      } as RawJob;
    });
  } catch {
    return [];
  }
}
