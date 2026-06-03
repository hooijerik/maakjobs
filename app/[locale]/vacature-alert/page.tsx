import type { Metadata } from "next";
import { Container, Card } from "@/components/ui";
import { AlertForm } from "@/components/AlertForm";
import { CATEGORIES, categoryLabel } from "@/lib/taxonomy";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.alertPage.title, description: dict.alertPage.subtitle, alternates: alternates(locale, "/vacature-alert") };
}

export default async function AlertPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const categories = CATEGORIES.map((c) => ({ slug: c.slug, label: categoryLabel(c.slug, locale) }));

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="text-4xl">📬</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{dict.alertPage.title}</h1>
        <p className="mt-2 text-slate-600">{dict.alertPage.subtitle}</p>
      </div>

      <Card className="mx-auto mt-8 max-w-lg p-6">
        <AlertForm t={dict.forms.alert} categories={categories} />
        <ul className="mt-5 space-y-2 text-sm text-slate-500">
          {dict.alertPage.bullets.map((b, i) => (
            <li key={i}>✓ {b}</li>
          ))}
        </ul>
      </Card>
    </Container>
  );
}
