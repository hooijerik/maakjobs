// Public read-only JSON API for jobs.
import { listJobs, type JobFilters, type SortKey } from "@/lib/queries";
import { SITE } from "@/lib/site";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const filters: JobFilters = {
    category: sp.get("categorie") || undefined,
    seniority: sp.get("niveau") || undefined,
    workMode: sp.get("werk") || undefined,
    city: sp.get("stad") || undefined,
    tool: sp.get("tool") || undefined,
    q: sp.get("q") || undefined,
  };
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit")) || 50));
  const page = Math.max(1, Number(sp.get("pagina")) || 1);
  const jobs = listJobs(filters, {
    sort: (sp.get("sort") as SortKey) || "newest",
    page,
    perPage: limit,
  });

  return Response.json({
    count: jobs.length,
    jobs: jobs.map((j) => ({
      title: j.title,
      company: j.company_name,
      url: `${SITE.url}/vacature/${j.slug}`,
      applyUrl: j.apply_url || j.url,
      category: j.category,
      seniority: j.seniority,
      workMode: j.work_mode,
      location: j.city || j.country,
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      salaryCurrency: j.salary_currency,
      postedAt: j.posted_at || j.first_seen_at,
    })),
  });
}
