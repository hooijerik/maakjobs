// Locale configuration. Maakjobs is Dutch-only; the `[locale]` segment is kept (always "nl")
// so the routing/layout structure inherited from the parent codebase stays intact.
export const LOCALES = ["nl"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(x: string | undefined | null): x is Locale {
  return x === "nl";
}

/** OpenGraph locale tag. */
export function ogLocale(_locale: Locale): string {
  return "nl_NL";
}
