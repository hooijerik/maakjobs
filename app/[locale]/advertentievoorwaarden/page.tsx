import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { ADVERTENTIEVOORWAARDEN } from "@/lib/legal";
import { alternates } from "@/lib/i18n/meta";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: ADVERTENTIEVOORWAARDEN.title,
    description: ADVERTENTIEVOORWAARDEN.intro[0],
    alternates: alternates(locale, "/advertentievoorwaarden"),
  };
}

export default function Page() {
  return <LegalPage doc={ADVERTENTIEVOORWAARDEN} />;
}
