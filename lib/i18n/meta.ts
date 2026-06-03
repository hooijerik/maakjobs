import { SITE } from "../site";
import { type Locale } from "./config";

/** App path (Dutch-only site → always the bare path). */
export function localePath(_locale: Locale, path: string): string {
  return path === "" ? "/" : path;
}

/** Canonical for a page, given the un-prefixed app path. Use in `generateMetadata`. */
export function alternates(locale: Locale, path: string) {
  const url = `${SITE.url}${localePath(locale, path)}`;
  return {
    canonical: url,
    languages: { "nl-NL": url, "x-default": url },
  };
}
