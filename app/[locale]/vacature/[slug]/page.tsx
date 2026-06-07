import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Chip, Card } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompanyLogo } from "@/components/CompanyLogo";
import { JobCard } from "@/components/JobCard";
import { JsonLd } from "@/components/JsonLd";
import { getJobBySlug, getRelatedJobs } from "@/lib/queries";
import { categoryLabel, seniorityLabel } from "@/lib/taxonomy";
import { formatSalaryRange, formatDate, timeAgo, sanitizeHtml, isFeatured } from "@/lib/format";
import { categoryUrl, companyUrl, locationUrl, seniorityUrl, withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";
import { SITE } from "@/lib/site";
import type { JobRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  recruitee: "Recruitee",
  homerun: "Homerun",
  personio: "Personio",
  workable: "Workable",
  smartrecruiters: "SmartRecruiters",
  indeed: "Indeed",
  linkedin: "LinkedIn",
  nationalevacaturebank: "Nationale Vacaturebank",
  magnet: "Magnet.me",
};

function employmentType(raw: string | null): string | undefined {
  const t = (raw || "").toLowerCase();
  if (/part|deeltijd/.test(t)) return "PART_TIME";
  if (/intern|stage/.test(t)) return "INTERN";
  if (/contract|tijdelijk|freelance/.test(t)) return "CONTRACTOR";
  if (/full|fulltime|vast|permanent/.test(t)) return "FULL_TIME";
  return undefined;
}

function locationLine(job: JobRow, _locale: Locale): string {
  const country = job.country === "NL" ? "Nederland" : job.country === "BE" ? "België" : null;
  return job.city || job.province || country || job.location_raw || "-";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  const job = getJobBySlug(slug);
  if (!job) return { title: dict.job.notFound };
  const loc = job.city || (job.country === "NL" ? "Nederland" : "Remote");
  const desc = (job.description_text || "").replace(/\s+/g, " ").slice(0, 155);
  return {
    title: dict.job.metaTitle(job.title, job.company_name, loc),
    description: desc || dict.job.metaTitle(job.title, job.company_name, loc),
    alternates: alternates(locale, `/vacature/${job.slug}`),
  };
}

export default async function JobPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { slug, locale } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();
  const dict = await getDictionary(locale);
  const L = (p: string) => withLocale(locale, p);

  const related = getRelatedJobs(job, 4);
  const salary = formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency, job.salary_interval, locale);
  const applyHref = job.apply_url || job.url;
  const descHtml = job.description_html ? sanitizeHtml(job.description_html) : null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descHtml || job.description_text || job.title,
    datePosted: job.posted_at || job.first_seen_at,
    employmentType: employmentType(job.employment_type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      logo: job.company_logo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city || undefined,
        addressRegion: job.province || undefined,
        addressCountry: job.country || "NL",
      },
    },
    jobLocationType: job.work_mode === "remote" ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements:
      job.work_mode === "remote" ? { "@type": "Country", name: "Netherlands" } : undefined,
    directApply: false,
    url: `${SITE.url}/vacature/${job.slug}`,
    ...(job.salary_disclosed && job.salary_min
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: job.salary_currency || "EUR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary_min,
              maxValue: job.salary_max || job.salary_min,
              unitText:
                job.salary_interval === "month" ? "MONTH" : job.salary_interval === "hour" ? "HOUR" : "YEAR",
            },
          },
        }
      : {}),
  };

  return (
    <Container className="py-8">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        ariaLabel={dict.breadcrumbs.aria}
        items={[
          { label: dict.breadcrumbs.home, href: L("/") },
          { label: dict.nav.jobs, href: L("/vacatures") },
          { label: categoryLabel(job.category, locale), href: L(categoryUrl(job.category)) },
          { label: job.title },
        ]}
      />

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Card className="p-6">
            <div className="flex gap-4">
              <CompanyLogo src={job.company_logo} name={job.company_name} size={56} />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 break-words">{job.title}</h1>
                <div className="mt-1 text-slate-600">
                  <Link href={L(companyUrl(job.company_slug))} className="font-medium hover:text-brand-700">
                    {job.company_name}
                  </Link>
                  <span className="mx-1.5 text-slate-300">·</span>
                  {locationLine(job, locale)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {isFeatured(job) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-950">
                  ★ Uitgelicht
                </span>
              )}
              <Chip tone="brand" href={L(categoryUrl(job.category))}>
                {categoryLabel(job.category, locale)}
              </Chip>
              {job.seniority && <Chip href={L(seniorityUrl(job.seniority))}>{seniorityLabel(job.seniority, locale)}</Chip>}
              {salary && <Chip tone="green">{salary}</Chip>}
              {job.ai_required ? <Chip tone="amber">AI</Chip> : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={applyHref}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {dict.job.applyAt(job.company_name)}
              </a>
              <span className="text-sm text-slate-400">
                {dict.job.posted} {timeAgo(job.posted_at || job.first_seen_at, locale)}
              </span>
            </div>
          </Card>

          <Card className="mt-6 p-6">
            <h2 className="text-lg font-bold text-slate-900">{dict.job.description}</h2>
            {descHtml ? (
              <div
                className="prose-job mt-3 break-words text-[15px] text-slate-700"
                dangerouslySetInnerHTML={{ __html: descHtml }}
              />
            ) : job.description_text ? (
              <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-slate-700">
                {job.description_text}
              </p>
            ) : (
              <p className="mt-3 text-slate-500">{dict.job.noDescription}</p>
            )}

            <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              {dict.job.collectedVia(SOURCE_LABELS[job.source] || job.source)}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900">{dict.job.aboutRole}</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Fact label={dict.job.company}>
                <Link href={L(companyUrl(job.company_slug))} className="text-brand-700 hover:underline">
                  {job.company_name}
                </Link>
              </Fact>
              <Fact label={dict.job.location}>
                {job.city_slug ? (
                  <Link href={L(locationUrl(job.city_slug))} className="text-brand-700 hover:underline">
                    {locationLine(job, locale)}
                  </Link>
                ) : (
                  locationLine(job, locale)
                )}
              </Fact>
              <Fact label={dict.job.category}>{categoryLabel(job.category, locale)}</Fact>
              {job.seniority && <Fact label={dict.job.level}>{seniorityLabel(job.seniority, locale)}</Fact>}
              {salary && <Fact label={dict.job.salary}>{salary}</Fact>}
              {job.reports_to && <Fact label={dict.job.reportsTo}>{job.reports_to}</Fact>}
              <Fact label={dict.job.posted}>{formatDate(job.posted_at || job.first_seen_at, locale)}</Fact>
            </dl>
            <a
              href={applyHref}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="mt-4 block rounded-lg bg-brand-600 px-4 py-2.5 text-center font-semibold text-white transition hover:bg-brand-700"
            >
              {dict.job.apply}
            </a>
          </Card>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">{dict.job.related}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((j) => (
              <JobCard key={j.id} job={j} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  );
}
