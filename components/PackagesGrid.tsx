import Link from "next/link";
import { PACKAGES } from "@/lib/packages";

export function PackagesGrid({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  popularLabel,
}: {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  popularLabel: string;
}) {
  return (
    <section className="mx-auto max-w-5xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">{subtitle}</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-2xl border bg-white p-5 ${
              p.highlight ? "border-brand-400 ring-1 ring-brand-200 shadow-sm" : "border-slate-200"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-2.5 left-5 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {popularLabel}
              </span>
            )}
            <h3 className="font-bold text-slate-900">{p.name}</h3>
            <div className="mt-1 text-lg font-extrabold text-brand-700">{p.price}</div>
            <p className="mt-1 text-sm text-slate-600">{p.blurb}</p>
            <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-700">
              {p.features.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-600">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className={`mt-4 block rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
                  p.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
