import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { guidesFor } from "@/lib/guides";
import { withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.insights.title, description: dict.insights.subtitle, alternates: alternates(locale, "/inzichten") };
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.insights;
  const L = (p: string) => withLocale(locale, p);
  const guides = guidesFor(locale);

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
      <p className="mt-1 max-w-2xl text-slate-600">{t.subtitle}</p>

      <Link
        href={L("/inzichten/salarissen")}
        className="mt-8 block rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white transition hover:shadow-lg"
      >
        <span className="text-sm font-medium text-brand-200">{t.featured}</span>
        <h2 className="mt-1 text-2xl font-bold">{t.reportTitle}</h2>
        <p className="mt-1 max-w-xl text-brand-100">{t.reportDek}</p>
        <span className="mt-4 inline-block font-semibold">{t.viewReport}</span>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <Card key={g.slug} className="p-6 transition hover:border-brand-300 hover:shadow-sm">
            <Link href={L(`/inzichten/${g.slug}`)}>
              <h3 className="text-lg font-bold text-slate-900">{g.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{g.dek}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700">{t.readMore}</span>
            </Link>
          </Card>
        ))}
      </div>
    </Container>
  );
}
