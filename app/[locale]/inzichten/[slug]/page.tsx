import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { guideBySlug, guideSlugs } from "@/lib/guides";
import { withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";

export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  const g = guideBySlug(locale, slug);
  if (!g) return { title: dict.insights.guideNotFound };
  return { title: g.title, description: g.dek, alternates: alternates(locale, `/inzichten/${g.slug}`) };
}

export default async function GuidePage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  const guide = guideBySlug(locale, slug);
  if (!guide) notFound();
  const L = (p: string) => withLocale(locale, p);

  return (
    <Container className="py-10">
      <article className="mx-auto max-w-2xl">
        <Breadcrumbs
          ariaLabel={dict.breadcrumbs.aria}
          items={[
            { label: dict.breadcrumbs.home, href: L("/") },
            { label: dict.nav.insights, href: L("/inzichten") },
            { label: guide.title },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{guide.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{guide.dek}</p>
        <p className="mt-1 text-sm text-slate-400">{dict.insights.updated(guide.updated)}</p>

        <div className="mt-8 space-y-5">
          {guide.sections.map((s, i) => (
            <div key={i}>
              {s.h && <h2 className="mb-1.5 text-xl font-bold text-slate-900">{s.h}</h2>}
              <p className="leading-relaxed text-slate-700">{s.p}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl bg-brand-50 p-5">
          <p className="font-medium text-brand-900">{dict.insights.ctaTitle}</p>
          <Link href={L("/vacatures")} className="mt-1 inline-block text-sm font-semibold text-brand-700">
            {dict.insights.ctaBtn}
          </Link>
        </div>
      </article>
    </Container>
  );
}
