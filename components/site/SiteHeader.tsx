import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "@/components/site/Logo";
import { MobileNav } from "@/components/site/MobileNav";
import { NAV } from "@/lib/site";
import { withLocale } from "@/lib/urls";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dict }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo locale={locale} className="text-lg" />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={withLocale(locale, item.href)}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={withLocale(locale, "/plaats-vacature")}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline-block"
          >
            {dict.header.postJob}
          </Link>
          <Link
            href={withLocale(locale, "/vacature-alert")}
            className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {dict.header.jobAlert}
          </Link>
          <MobileNav locale={locale} nav={dict.nav} header={dict.header} />
        </div>
      </Container>
    </header>
  );
}
