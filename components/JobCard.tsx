import Link from "next/link";
import { CompanyLogo } from "./CompanyLogo";
import { Chip } from "./ui";
import { formatSalaryRange, timeAgo, isFeatured } from "@/lib/format";
import { categoryLabel, seniorityLabel } from "@/lib/taxonomy";
import { categoryUrl, companyUrl, jobUrl, seniorityUrl, withLocale } from "@/lib/urls";
import type { JobRow } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

function locationText(job: JobRow): string {
  const country = job.country === "NL" ? "Nederland" : job.country === "BE" ? "België" : null;
  return job.city || job.province || country || job.location_raw || "-";
}

export function JobCard({ job, locale }: { job: JobRow; locale: Locale }) {
  const L = (p: string) => withLocale(locale, p);
  const salary = formatSalaryRange(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
    job.salary_interval,
    locale,
  );
  const featured = isFeatured(job);
  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition hover:shadow-sm sm:p-5 ${
        featured ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200 hover:border-brand-300"
      }`}
    >
      <div className="flex gap-4">
        <CompanyLogo src={job.company_logo} name={job.company_name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-snug text-slate-900 break-words">
                <Link href={L(jobUrl(job.slug))} className="hover:text-brand-700">
                  {job.title}
                </Link>
              </h3>
              <div className="mt-0.5 truncate text-sm text-slate-500">
                <Link
                  href={L(companyUrl(job.company_slug))}
                  className="font-medium text-slate-700 hover:text-brand-700"
                >
                  {job.company_name}
                </Link>
                <span className="mx-1.5 text-slate-300">·</span>
                {locationText(job)}
              </div>
            </div>
            <time className="shrink-0 whitespace-nowrap text-xs text-slate-400">
              {timeAgo(job.posted_at || job.first_seen_at, locale)}
            </time>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950">
                ★ Uitgelicht
              </span>
            )}
            <Chip tone="brand" href={L(categoryUrl(job.category))}>
              {categoryLabel(job.category, locale)}
            </Chip>
            {job.seniority && (
              <Chip href={L(seniorityUrl(job.seniority))}>{seniorityLabel(job.seniority, locale)}</Chip>
            )}
            {salary && <Chip tone="green">{salary}</Chip>}
            {job.ai_required ? <Chip tone="amber">AI</Chip> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
