import Link from "next/link";
import { Container, Chip, Stat, SectionHeading, Card } from "@/components/ui";
import { JobCard } from "@/components/JobCard";
import { CompanyLogo } from "@/components/CompanyLogo";
import { getStats, getFacets, listRecentShuffled, listCompanies } from "@/lib/queries";
import { CATEGORIES, categoryLabel } from "@/lib/taxonomy";
import { formatNumber } from "@/lib/format";
import { categoryUrl, companyUrl, locationUrl, remoteUrl, withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.home;
  const L = (p: string) => withLocale(locale, p);

  const stats = getStats();
  const facets = getFacets();
  const latest = listRecentShuffled(8, 50);
  const companies = listCompanies(14);
  const catCount = new Map(facets.categories.map((f) => [f.key, f.count]));
  const sortedCats = [...CATEGORIES]
    .filter((c) => c.slug !== "overig-techniek") // catch-all: not a featured pill
    .sort((a, b) => (catCount.get(b.slug) ?? 0) - (catCount.get(a.slug) ?? 0));
  const remoteCount = facets.workMode.find((w) => w.key === "remote")?.count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50/70 to-slate-50">
        <Container className="py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
              🚀 {t.badge(stats.newThisWeek)}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {t.heroPre} <span className="text-brand-600">{t.heroHighlight}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{t.heroSubtitle}</p>

            <form action={L("/vacatures")} method="get" className="mx-auto mt-7 flex max-w-xl gap-2">
              <input
                type="text"
                name="q"
                placeholder={t.searchPlaceholder}
                className="h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
              <button
                type="submit"
                className="h-12 rounded-xl bg-brand-600 px-6 font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {t.search}
              </button>
            </form>
          </div>

          {/* Categories: wrap on mobile, single row on desktop */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap">
            {sortedCats.map((c) => (
              <Link
                key={c.slug}
                href={L(categoryUrl(c.slug))}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
              >
                {categoryLabel(c.slug, locale)}
                <span className="text-slate-400">{catCount.get(c.slug) ?? 0}</span>
              </Link>
            ))}
            <Link
              href={L(remoteUrl())}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700"
            >
              {dict.common.remote}
              <span className="text-slate-400">{remoteCount}</span>
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 text-center">
            <Stat value={formatNumber(stats.activeJobs, locale)} label={t.statActive} />
            <Stat value={formatNumber(stats.newThisWeek, locale)} label={t.statNew} />
            <Stat value={formatNumber(stats.companies, locale)} label={t.statCompanies} />
          </div>
        </Container>
      </section>

      {/* Latest jobs + sidebar */}
      <Container className="py-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <SectionHeading title={t.latest} href={L("/vacatures")} linkLabel={t.viewAll} />
            <div className="space-y-3">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} locale={locale} />
              ))}
            </div>
          </div>

          <aside className="min-w-0 space-y-8">
            <div>
              <SectionHeading title={t.popularLocations} href={L("/locaties")} linkLabel={dict.common.all} />
              <div className="flex flex-wrap gap-2">
                {facets.cities.slice(0, 10).map((c) => (
                  <Chip key={c.key} href={L(locationUrl(c.key))}>
                    {c.label} <span className="text-slate-400">{c.count}</span>
                  </Chip>
                ))}
                <Chip href={L(remoteUrl())} tone="brand">
                  {dict.common.remote} <span className="text-brand-400">{remoteCount}</span>
                </Chip>
              </div>
            </div>

            <Card className="bg-brand-600 p-6 text-white">
              <h3 className="text-lg font-bold">{t.alertTitle}</h3>
              <p className="mt-1 text-sm text-brand-100">{t.alertBody}</p>
              <Link
                href={L("/vacature-alert")}
                className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                {t.alertCta}
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900">{t.salaryTitle}</h3>
              <p className="mt-1 text-sm text-slate-600">{t.salaryBody}</p>
              <Link
                href={L("/inzichten/salarissen")}
                className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {t.salaryCta}
              </Link>
            </Card>
          </aside>
        </div>
      </Container>

      {/* Companies */}
      <Container className="py-14">
        <SectionHeading title={t.companiesHiring} href={L("/bedrijven")} linkLabel={dict.common.viewAll} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={L(companyUrl(c.slug))}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-sm"
            >
              <CompanyLogo src={c.logo_url} name={c.name} size={36} />
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-800">{c.name}</div>
                <div className="text-xs text-slate-500">{dict.companies.openRoles(c.open_count)}</div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
