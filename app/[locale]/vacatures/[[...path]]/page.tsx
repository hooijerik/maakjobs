import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { JobCard } from "@/components/JobCard";
import { FilterSidebar, type ActiveParams } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";
import {
  countJobs,
  getFacets,
  listJobs,
  provinceFromSlug,
  salaryBand,
  type Facets,
  type JobFilters,
  type SortKey,
} from "@/lib/queries";
import { CATEGORY_BY_SLUG, SENIORITY_BY_SLUG, categoryLabel, categoryDescription, seniorityLabel } from "@/lib/taxonomy";
import { formatSalaryRange, titleCase } from "@/lib/format";
import { buildVacaturesUrl, PARAMS, withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";
import type { Dict } from "@/lib/i18n/types";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;
const SORTS: SortKey[] = ["newest", "salary"];

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type Resolved = {
  filter: JobFilters;
  heading: string;
  intro?: string;
  crumbs: Crumb[];
  canonical: string;
};

function resolvePath(path: string[] | undefined, facets: Facets, locale: Locale, dict: Dict): Resolved {
  const b = dict.browse;
  const home: Crumb = { label: dict.breadcrumbs.home, href: withLocale(locale, "/") };
  const vac: Crumb = { label: dict.nav.jobs, href: withLocale(locale, "/vacatures") };

  if (!path || path.length === 0) {
    return {
      filter: {},
      heading: b.headingAll,
      intro: b.introAll,
      crumbs: [home, { label: dict.nav.jobs }],
      canonical: "/vacatures",
    };
  }
  const [seg, val] = path;

  if (seg === "remote" && path.length === 1) {
    return {
      filter: { workMode: "remote" },
      heading: b.headingRemote,
      intro: b.introRemote,
      crumbs: [home, vac, { label: dict.common.remote }],
      canonical: "/vacatures/remote",
    };
  }
  if (seg === "categorie" && val) {
    if (!CATEGORY_BY_SLUG.get(val as never)) notFound();
    const label = categoryLabel(val, locale);
    return {
      filter: { category: val },
      heading: b.headingCategory(label),
      intro: categoryDescription(val, locale),
      crumbs: [home, vac, { label }],
      canonical: `/vacatures/categorie/${val}`,
    };
  }
  if (seg === "niveau" && val) {
    if (!SENIORITY_BY_SLUG.get(val as never)) notFound();
    const label = seniorityLabel(val, locale);
    return {
      filter: { seniority: val },
      heading: b.headingSeniority(label),
      crumbs: [home, vac, { label }],
      canonical: `/vacatures/niveau/${val}`,
    };
  }
  if (seg === "locatie" && val) {
    const province = provinceFromSlug(val);
    if (province) {
      return {
        filter: { province },
        heading: b.headingLocation(province),
        crumbs: [home, vac, { label: province }],
        canonical: `/vacatures/locatie/${val}`,
      };
    }
    const cityLabel = facets.cities.find((c) => c.key === val)?.label || titleCase(val.replace(/-/g, " "));
    return {
      filter: { city: val },
      heading: b.headingLocation(cityLabel),
      crumbs: [home, vac, { label: cityLabel }],
      canonical: `/vacatures/locatie/${val}`,
    };
  }
  notFound();
}

function filtersFromQuery(sp: Record<string, string | string[] | undefined>): JobFilters {
  const f: JobFilters = {};
  const cat = str(sp[PARAMS.category]);
  if (cat) f.category = cat;
  const sen = str(sp[PARAMS.seniority]);
  if (sen) f.seniority = sen;
  const wm = str(sp[PARAMS.workMode]);
  if (wm) f.workMode = wm;
  const city = str(sp[PARAMS.city]);
  if (city) f.city = city;
  const tool = str(sp[PARAMS.tool]);
  if (tool) f.tool = tool;
  const sal = Number(str(sp[PARAMS.salary]));
  if (sal > 0) f.salaryMin = sal;
  const ai = str(sp[PARAMS.ai]);
  if (ai === "1" || ai === "true") f.ai = true;
  const days = Number(str(sp[PARAMS.datePosted]));
  if ([1, 3, 7, 14, 30].includes(days)) f.datePosted = days;
  const q = str(sp[PARAMS.q]);
  if (q) f.q = q;
  return f;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; path?: string[] }>;
}): Promise<Metadata> {
  const { path, locale } = await params;
  const dict = await getDictionary(locale);
  const r = resolvePath(
    path,
    { categories: [], seniority: [], workMode: [], country: [], cities: [], tools: [], lang: [] },
    locale,
    dict,
  );
  return {
    title: r.heading,
    description: r.intro || r.heading,
    alternates: alternates(locale, r.canonical),
  };
}

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { path, locale } = await params;
  const sp = await searchParams;
  const dict = await getDictionary(locale);
  const facets = getFacets();
  const r = resolvePath(path, facets, locale, dict);

  const filters: JobFilters = { ...r.filter, ...filtersFromQuery(sp) };
  const sort = (str(sp[PARAMS.sort]) as SortKey) || "newest";
  const page = Math.max(1, Number(str(sp[PARAMS.page])) || 1);

  const total = countJobs(filters);
  const jobs = listJobs(filters, { sort, page, perPage: PER_PAGE });
  const band = salaryBand(filters);

  const active: ActiveParams = {
    category: filters.category,
    seniority: filters.seniority,
    workMode: filters.workMode,
    city: filters.city,
    tool: filters.tool,
    salary: filters.salaryMin ? String(filters.salaryMin) : undefined,
    ai: filters.ai ? "1" : undefined,
    datePosted: filters.datePosted ? String(filters.datePosted) : undefined,
    q: filters.q,
  };

  return (
    <Container className="py-8">
      <Breadcrumbs items={r.crumbs} ariaLabel={dict.breadcrumbs.aria} />
      <div className="mt-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{r.heading}</h1>
        <p className="mt-1 text-slate-500">
          {dict.browse.results(total)}
          {band && (
            <>
              {" · "}
              <span className="text-slate-600">
                {dict.browse.median} {formatSalaryRange(band.min, band.max, "EUR", "year", locale)}
              </span>{" "}
              <span className="text-slate-400">({dict.browse.basedOn(band.count)})</span>
            </>
          )}
        </p>
        {r.intro && <p className="mt-2 max-w-2xl text-sm text-slate-500">{r.intro}</p>}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-4">
        {/* Filters */}
        <div className="min-w-0 lg:col-span-1">
          <details className="rounded-xl border border-slate-200 bg-white p-4 lg:hidden">
            <summary className="cursor-pointer font-semibold text-slate-900">{dict.filters.title}</summary>
            <div className="mt-4">
              <FilterSidebar facets={facets} active={active} locale={locale} dict={dict} />
            </div>
          </details>
          <aside className="sticky top-20 hidden rounded-xl border border-slate-200 bg-white p-4 lg:block">
            <FilterSidebar facets={facets} active={active} locale={locale} dict={dict} />
          </aside>
        </div>

        {/* Results */}
        <div className="min-w-0 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">{dict.browse.results(total)}</span>
            <div className="flex items-center gap-1 text-sm">
              <span className="hidden text-slate-400 sm:inline">{dict.browse.sort}:</span>
              {SORTS.map((s) => (
                <Link
                  key={s}
                  href={withLocale(locale, buildVacaturesUrl({ ...active, sort: s === "newest" ? undefined : s }))}
                  className={`rounded-lg px-2.5 py-1 ${
                    sort === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {s === "newest" ? dict.browse.newest : dict.browse.salary}
                </Link>
              ))}
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-medium text-slate-700">{dict.browse.noResults}</p>
              <p className="mt-1 text-sm text-slate-500">{dict.browse.noResultsBody}</p>
              <Link href={withLocale(locale, "/vacatures")} className="mt-4 inline-block text-sm font-semibold text-brand-700">
                {dict.browse.clearAll}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} locale={locale} />
              ))}
            </div>
          )}

          <Pagination total={total} perPage={PER_PAGE} page={page} active={active} sort={sort} locale={locale} dict={dict.pagination} />
        </div>
      </div>
    </Container>
  );
}
