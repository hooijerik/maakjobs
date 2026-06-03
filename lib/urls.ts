// URL helpers shared across the app. Dutch query-param names.
import type { Locale } from "./i18n/config";

/** App path. Maakjobs is Dutch-only at the root, so this just normalizes the bare path.
 *  The `locale` param is kept so call sites inherited from the parent codebase stay unchanged. */
export const withLocale = (_locale: Locale, path: string) => {
  return path === "" ? "/" : path;
};

export const PARAMS = {
  category: "categorie",
  seniority: "niveau",
  workMode: "werk",
  city: "stad",
  province: "provincie",
  tool: "tool",
  salary: "salaris",
  ai: "ai",
  datePosted: "geplaatst",
  lang: "taal",
  q: "q",
  sort: "sort",
  page: "pagina",
} as const;

export const jobUrl = (slug: string) => `/vacature/${slug}`;
export const companyUrl = (slug: string) => `/bedrijven/${slug}`;
export const categoryUrl = (slug: string) => `/vacatures/categorie/${slug}`;
export const seniorityUrl = (slug: string) => `/vacatures/niveau/${slug}`;
export const locationUrl = (slug: string) => `/vacatures/locatie/${slug}`;
export const toolUrl = (slug: string) => `/tools/${slug}`;
export const remoteUrl = () => `/vacatures/remote`;

/** Build a /vacatures URL from a set of query params (drops empty values). */
export function buildVacaturesUrl(
  params: Partial<Record<keyof typeof PARAMS, string | number | undefined>>,
  base = "/vacatures",
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === null) continue;
    sp.set(PARAMS[key as keyof typeof PARAMS], String(value));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
