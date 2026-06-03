import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompanyLogo } from "@/components/CompanyLogo";
import { JobCard } from "@/components/JobCard";
import { getCompanyBySlug, listJobs } from "@/lib/queries";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";
import { withLocale } from "@/lib/urls";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  const c = getCompanyBySlug(slug);
  if (!c) return { title: dict.companies.notFound };
  return {
    title: dict.companies.jobsAt(c.name),
    description: dict.companies.jobsAt(c.name),
    alternates: alternates(locale, `/bedrijven/${c.slug}`),
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();
  const dict = await getDictionary(locale);

  const jobs = listJobs({ company: slug }, { sort: "newest", perPage: 100 });
  const website = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;

  return (
    <Container className="py-8">
      <Breadcrumbs
        ariaLabel={dict.breadcrumbs.aria}
        items={[
          { label: dict.breadcrumbs.home, href: withLocale(locale, "/") },
          { label: dict.nav.companies, href: withLocale(locale, "/bedrijven") },
          { label: company.name },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <CompanyLogo src={company.logo_url} name={company.name} size={64} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{company.name}</h1>
          <p className="mt-0.5 text-slate-500">
            {dict.companies.openRoles(jobs.length)}
            {website && (
              <>
                {" · "}
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 hover:underline"
                >
                  {dict.companies.website}
                </a>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} locale={locale} />
        ))}
      </div>
    </Container>
  );
}
