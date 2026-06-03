// Ashby public job board API.
// https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true
import { fetchJson, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  const data = await fetchJson<any>(
    `https://api.ashbyhq.com/posting-api/job-board/${c.atsSlug}?includeCompensation=true`,
  );
  const jobs: any[] = data?.jobs ?? [];
  return jobs.map((j) => {
    const summary: string | undefined = j.compensation?.compensationTierSummary;
    const baseText: string = j.descriptionPlain ?? "";
    return {
      source: "ashby",
      sourceId: String(j.id),
      companyName: c.name,
      companyWebsite: c.website,
      companyHandle: c.atsSlug,
      title: String(j.title ?? "").trim(),
      url: j.jobUrl,
      applyUrl: j.applyUrl,
      locationRaw: j.isRemote ? (j.location ? `Remote, ${j.location}` : "Remote") : j.location,
      department: j.team ?? j.department,
      employmentType: j.employmentType,
      descriptionHtml: j.descriptionHtml,
      // Append the comp summary so the salary parser can pick it up.
      descriptionText: summary ? `${baseText}\nCompensation: ${summary}` : baseText || undefined,
      postedAt: toIso(j.publishedAt) ?? toIso(j.updatedAt),
    } as RawJob;
  });
}
