import Link from "next/link";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/site";
import { CATEGORIES, categoryLabel } from "@/lib/taxonomy";
import { categoryUrl, locationUrl, withLocale } from "@/lib/urls";
import { getTopCities } from "@/lib/queries";
import { Logo } from "@/components/site/Logo";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dict }) {
  const L = (path: string) => withLocale(locale, path);
  const f = dict.footer;
  // Top locations by active-job count - same source as the filter sidebar.
  let cities: { key: string; label?: string }[] = [];
  try {
    cities = getTopCities(8);
  } catch {
    /* DB may be empty at build time */
  }
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{f.categories}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {CATEGORIES.filter((c) => c.slug !== "overig-techniek").slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link href={L(categoryUrl(c.slug))} className="hover:text-brand-700">
                    {categoryLabel(c.slug, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{f.locations}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {cities.map((c) => (
                <li key={c.key}>
                  <Link href={L(locationUrl(c.key))} className="hover:text-brand-700">
                    {f.cityLink(c.label || c.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{f.discover}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href={L("/vacatures")} className="hover:text-brand-700">{f.allJobs}</Link></li>
              <li><Link href={L("/bedrijven")} className="hover:text-brand-700">{f.companies}</Link></li>
              <li><Link href={L("/inzichten/salarissen")} className="hover:text-brand-700">{f.salaryReport}</Link></li>
              <li><Link href={L("/inzichten")} className="hover:text-brand-700">{f.insightsGuides}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{f.forEmployers}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href={L("/werkgevers")} className="hover:text-brand-700">{f.employers}</Link></li>
              <li><Link href={L("/plaats-vacature")} className="hover:text-brand-700">{f.postJob}</Link></li>
              <li><Link href={L("/vacature-alert")} className="hover:text-brand-700">{f.jobAlert}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2 text-slate-500">
            <Logo locale={locale} />
            <span>- {dict.meta.tagline}.</span>
          </div>
          <p className="flex flex-wrap items-center gap-1.5">
            <span>© {SITE.name}. {f.collected}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
