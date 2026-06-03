import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { countLongOpenJobs } from "@/lib/queries";
import { withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const e = (await getDictionary(locale)).employers;
  return {
    title: `${e.titlePre} ${e.titleHighlight}${e.titleSuffix ? ` ${e.titleSuffix}` : ""}`,
    description: e.subtitle,
    alternates: alternates(locale, "/werkgevers"),
  };
}

export default async function EmployersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const e = (await getDictionary(locale)).employers;
  const longOpen = countLongOpenJobs(30);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {e.titlePre} <span className="text-brand-600">{e.titleHighlight}</span>
          {e.titleSuffix ? ` ${e.titleSuffix}` : ""}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{e.subtitle}</p>
        <Link
          href={withLocale(locale, "/plaats-vacature")}
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {e.postJob}
        </Link>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
        {e.steps.map((s, i) => (
          <Card key={i} className="p-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
              {i + 1}
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">{s.t}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.d}</p>
          </Card>
        ))}
      </div>

    </Container>
  );
}
