import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CATEGORIES, SENIORITY } from "@/lib/taxonomy";
import {
  getActiveCompanySlugs,
  getAllActiveJobSlugs,
  getFacets,
  getProvinceFacets,
} from "@/lib/queries";
import { guideSlugs } from "@/lib/guides";
import { withLocale } from "@/lib/urls";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const u = (p: string) => `${base}${p}`;
  const items: MetadataRoute.Sitemap = [];

  const add = (path: string, extra?: Partial<MetadataRoute.Sitemap[number]>) => {
    items.push({ url: u(withLocale("nl", path)), ...extra });
  };

  const staticPaths = [
    "/",
    "/vacatures",
    "/vacatures/remote",
    "/bedrijven",
    "/locaties",
    "/inzichten",
    "/inzichten/salarissen",
    "/werkgevers",
    "/plaats-vacature",
    "/vacature-alert",
  ];
  for (const p of staticPaths) add(p, { changeFrequency: "daily" });

  for (const c of CATEGORIES) add(`/vacatures/categorie/${c.slug}`);
  for (const s of SENIORITY) add(`/vacatures/niveau/${s.slug}`);
  for (const slug of guideSlugs()) add(`/inzichten/${slug}`);

  try {
    const facets = getFacets();
    for (const city of facets.cities) add(`/vacatures/locatie/${city.key}`);
    for (const p of getProvinceFacets()) add(`/vacatures/locatie/${slugify(p.province)}`);
    for (const c of getActiveCompanySlugs()) add(`/bedrijven/${c}`);
    for (const j of getAllActiveJobSlugs())
      add(`/vacature/${j.slug}`, { lastModified: j.last_seen_at });
  } catch {
    /* DB may be empty at build time - static paths still emitted */
  }

  return items;
}
