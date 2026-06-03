// Recruitee public offers API (Dutch ATS - common with NL employers).
// https://{slug}.recruitee.com/api/offers/
import { fetchJson, toIso } from "../http";
import type { RawJob, SeedCompany } from "../../../lib/types";

export async function fetchJobs(c: SeedCompany): Promise<RawJob[]> {
  const data = await fetchJson<any>(`https://${c.atsSlug}.recruitee.com/api/offers/`);
  const offers: any[] = data?.offers ?? [];
  return offers
    .filter((o) => o.status === "published" || o.status == null)
    .map((o) => {
      const html = [o.description, o.requirements].filter(Boolean).join("");
      const loc = [o.city, o.country_code].filter(Boolean).join(", ") || o.location;
      return {
        source: "recruitee",
        sourceId: String(o.id),
        companyName: c.name,
        companyWebsite: c.website,
        companyHandle: c.atsSlug,
        title: String(o.title ?? "").trim(),
        url: o.careers_url,
        applyUrl: o.careers_apply_url,
        locationRaw: loc,
        department: o.department,
        employmentType: o.employment_type_code,
        descriptionHtml: html || undefined,
        postedAt: toIso(o.published_at) ?? toIso(o.created_at),
      } as RawJob;
    });
}
