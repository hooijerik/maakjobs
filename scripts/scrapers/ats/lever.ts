// Lever public postings API. Tries the global and EU instances.
// https://api.lever.co/v0/postings/{slug}?mode=json
import { fetchJson, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

async function fetchPostings(slug: string): Promise<any[]> {
  for (const base of ["https://api.lever.co", "https://api.eu.lever.co"]) {
    try {
      const d = await fetchJson<any>(`${base}/v0/postings/${slug}?mode=json`);
      if (Array.isArray(d) && d.length) return d;
    } catch {
      /* try next base */
    }
  }
  return [];
}

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  const postings = await fetchPostings(c.atsSlug);
  return postings.map((j) => {
    const lists = Array.isArray(j.lists) ? j.lists : [];
    const html = [j.description, ...lists.map((l: any) => `<h3>${l.text}</h3>${l.content}`), j.additional]
      .filter(Boolean)
      .join("");
    return {
      source: "lever",
      sourceId: String(j.id),
      companyName: c.name,
      companyWebsite: c.website,
      companyHandle: c.atsSlug,
      title: String(j.text ?? "").trim(),
      url: j.hostedUrl,
      applyUrl: j.applyUrl,
      locationRaw: j.categories?.location ?? j.workplaceType,
      department: j.categories?.team ?? j.categories?.department,
      employmentType: j.categories?.commitment,
      descriptionHtml: html || undefined,
      descriptionText: j.descriptionPlain,
      postedAt: toIso(j.createdAt),
    } as RawJob;
  });
}
