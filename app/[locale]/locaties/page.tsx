import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getFacets, getProvinceFacets } from "@/lib/queries";
import { slugify } from "@/lib/format";
import { locationUrl, remoteUrl, withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return { title: dict.locations.title, description: dict.locations.subtitle, alternates: alternates(locale, "/locaties") };
}

export default async function LocationsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const L = (p: string) => withLocale(locale, p);
  const facets = getFacets();
  const provinces = getProvinceFacets();
  const remoteCount = facets.workMode.find((w) => w.key === "remote")?.count ?? 0;

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{dict.locations.title}</h1>
      <p className="mt-1 text-slate-500">{dict.locations.subtitle}</p>

      <div className="mt-8">
        <Link
          href={L(remoteUrl())}
          className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-5 py-4 transition hover:border-brand-300"
        >
          <span className="font-semibold text-brand-800">{dict.locations.remote}</span>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-medium text-brand-700">
            {remoteCount}
          </span>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{dict.locations.cities}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {facets.cities.map((c) => (
            <Link
              key={c.key}
              href={L(locationUrl(c.key))}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-sm"
            >
              <span className="font-medium text-slate-800">{c.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {c.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {provinces.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{dict.locations.provinces}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {provinces.map((p) => (
              <Link
                key={p.province}
                href={L(locationUrl(slugify(p.province)))}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-sm"
              >
                <span className="font-medium text-slate-800">{p.province}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {p.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
