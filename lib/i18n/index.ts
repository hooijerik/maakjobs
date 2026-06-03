// Server-side dictionary loader. Call from Server Components/pages; pass the
// resulting object (or slices) as props into Client Components.
import type { Locale } from "./config";
import type { Dict } from "./types";

const loaders: Record<Locale, () => Promise<Dict>> = {
  nl: () => import("./dictionaries/nl").then((m) => m.nl),
};

export function getDictionary(locale: Locale): Promise<Dict> {
  return loaders[locale]();
}

export type { Dict } from "./types";
export { type Locale, LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, ogLocale } from "./config";
