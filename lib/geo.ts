// Coordinates for Dutch cities, used by the optional location + distance ("afstand")
// filter on job alerts. Keyed by city_slug (slugify of the city name) so it lines up
// with jobs.city_slug. Not exhaustive — a city absent here simply won't match a radius
// query (the filter is optional, so that degrades gracefully).

export interface GeoCity {
  slug: string;
  label: string;
  lat: number;
  lng: number;
  /** Alternative slugs that should resolve to the same place (e.g. Den Bosch). */
  aliases?: string[];
}

// ~80 largest NL cities + a few notable trade towns, covering all 12 provinces.
export const NL_CITIES: GeoCity[] = [
  { slug: "amsterdam", label: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { slug: "rotterdam", label: "Rotterdam", lat: 51.9244, lng: 4.4777 },
  { slug: "den-haag", label: "Den Haag", lat: 52.0705, lng: 4.3007, aliases: ["s-gravenhage", "the-hague", "den-haag-gravenhage"] },
  { slug: "utrecht", label: "Utrecht", lat: 52.0907, lng: 5.1214 },
  { slug: "eindhoven", label: "Eindhoven", lat: 51.4416, lng: 5.4697 },
  { slug: "groningen", label: "Groningen", lat: 53.2194, lng: 6.5665 },
  { slug: "tilburg", label: "Tilburg", lat: 51.5606, lng: 5.0919 },
  { slug: "almere", label: "Almere", lat: 52.3508, lng: 5.2647 },
  { slug: "breda", label: "Breda", lat: 51.5719, lng: 4.7683 },
  { slug: "nijmegen", label: "Nijmegen", lat: 51.8126, lng: 5.8372 },
  { slug: "apeldoorn", label: "Apeldoorn", lat: 52.2112, lng: 5.9699 },
  { slug: "haarlem", label: "Haarlem", lat: 52.3874, lng: 4.6462 },
  { slug: "arnhem", label: "Arnhem", lat: 51.9851, lng: 5.8987 },
  { slug: "enschede", label: "Enschede", lat: 52.2215, lng: 6.8937 },
  { slug: "amersfoort", label: "Amersfoort", lat: 52.1561, lng: 5.3878 },
  { slug: "zaandam", label: "Zaandam", lat: 52.4389, lng: 4.8167, aliases: ["zaanstad"] },
  { slug: "s-hertogenbosch", label: "'s-Hertogenbosch", lat: 51.6978, lng: 5.3037, aliases: ["den-bosch", "shertogenbosch"] },
  { slug: "zwolle", label: "Zwolle", lat: 52.5168, lng: 6.083 },
  { slug: "leiden", label: "Leiden", lat: 52.1601, lng: 4.497 },
  { slug: "maastricht", label: "Maastricht", lat: 50.8514, lng: 5.691 },
  { slug: "dordrecht", label: "Dordrecht", lat: 51.8133, lng: 4.6901 },
  { slug: "ede", label: "Ede", lat: 52.0402, lng: 5.6649 },
  { slug: "leeuwarden", label: "Leeuwarden", lat: 53.2012, lng: 5.7999 },
  { slug: "alkmaar", label: "Alkmaar", lat: 52.6324, lng: 4.7534 },
  { slug: "emmen", label: "Emmen", lat: 52.7792, lng: 6.9061 },
  { slug: "delft", label: "Delft", lat: 52.0116, lng: 4.3571 },
  { slug: "venlo", label: "Venlo", lat: 51.3704, lng: 6.1724 },
  { slug: "deventer", label: "Deventer", lat: 52.2552, lng: 6.1639 },
  { slug: "helmond", label: "Helmond", lat: 51.4793, lng: 5.657 },
  { slug: "oss", label: "Oss", lat: 51.765, lng: 5.518 },
  { slug: "hilversum", label: "Hilversum", lat: 52.2292, lng: 5.1669 },
  { slug: "heerlen", label: "Heerlen", lat: 50.8882, lng: 5.9795 },
  { slug: "amstelveen", label: "Amstelveen", lat: 52.3114, lng: 4.8701 },
  { slug: "roosendaal", label: "Roosendaal", lat: 51.5308, lng: 4.4653 },
  { slug: "purmerend", label: "Purmerend", lat: 52.505, lng: 4.9592 },
  { slug: "schiedam", label: "Schiedam", lat: 51.9197, lng: 4.3886 },
  { slug: "lelystad", label: "Lelystad", lat: 52.5185, lng: 5.4714 },
  { slug: "almelo", label: "Almelo", lat: 52.3569, lng: 6.6626 },
  { slug: "gouda", label: "Gouda", lat: 52.0117, lng: 4.7105 },
  { slug: "zoetermeer", label: "Zoetermeer", lat: 52.0575, lng: 4.4931 },
  { slug: "hoorn", label: "Hoorn", lat: 52.6425, lng: 5.0597 },
  { slug: "vlaardingen", label: "Vlaardingen", lat: 51.9121, lng: 4.3419 },
  { slug: "assen", label: "Assen", lat: 52.9929, lng: 6.5642 },
  { slug: "bergen-op-zoom", label: "Bergen op Zoom", lat: 51.4948, lng: 4.287 },
  { slug: "capelle-aan-den-ijssel", label: "Capelle aan den IJssel", lat: 51.93, lng: 4.5772 },
  { slug: "veenendaal", label: "Veenendaal", lat: 52.0287, lng: 5.5544 },
  { slug: "katwijk", label: "Katwijk", lat: 52.2036, lng: 4.4101 },
  { slug: "zeist", label: "Zeist", lat: 52.089, lng: 5.2317 },
  { slug: "nieuwegein", label: "Nieuwegein", lat: 52.0292, lng: 5.0806 },
  { slug: "roermond", label: "Roermond", lat: 51.1942, lng: 5.987 },
  { slug: "doetinchem", label: "Doetinchem", lat: 51.965, lng: 6.288 },
  { slug: "den-helder", label: "Den Helder", lat: 52.9563, lng: 4.7601 },
  { slug: "hengelo", label: "Hengelo", lat: 52.2659, lng: 6.793 },
  { slug: "sittard", label: "Sittard", lat: 51.001, lng: 5.8694, aliases: ["sittard-geleen"] },
  { slug: "heerenveen", label: "Heerenveen", lat: 52.9602, lng: 5.9195 },
  { slug: "drachten", label: "Drachten", lat: 53.1122, lng: 6.0989 },
  { slug: "spijkenisse", label: "Spijkenisse", lat: 51.8454, lng: 4.3294 },
  { slug: "harderwijk", label: "Harderwijk", lat: 52.341, lng: 5.6208 },
  { slug: "hoogeveen", label: "Hoogeveen", lat: 52.7225, lng: 6.4759 },
  { slug: "middelburg", label: "Middelburg", lat: 51.4988, lng: 3.6136 },
  { slug: "vlissingen", label: "Vlissingen", lat: 51.4426, lng: 3.5736 },
  { slug: "goes", label: "Goes", lat: 51.5042, lng: 3.8889 },
  { slug: "terneuzen", label: "Terneuzen", lat: 51.336, lng: 3.828 },
  { slug: "tiel", label: "Tiel", lat: 51.8859, lng: 5.429 },
  { slug: "wageningen", label: "Wageningen", lat: 51.9692, lng: 5.6654 },
  { slug: "zutphen", label: "Zutphen", lat: 52.1383, lng: 6.2014 },
  { slug: "kampen", label: "Kampen", lat: 52.5552, lng: 5.9111 },
  { slug: "meppel", label: "Meppel", lat: 52.6957, lng: 6.1939 },
  { slug: "sneek", label: "Sneek", lat: 53.0319, lng: 5.6589 },
  { slug: "rijssen", label: "Rijssen", lat: 52.306, lng: 6.521 },
  { slug: "woerden", label: "Woerden", lat: 52.0857, lng: 4.8835 },
  { slug: "houten", label: "Houten", lat: 52.0289, lng: 5.168 },
  { slug: "veldhoven", label: "Veldhoven", lat: 51.4181, lng: 5.4036 },
  { slug: "waalwijk", label: "Waalwijk", lat: 51.6819, lng: 5.07 },
  { slug: "oosterhout", label: "Oosterhout", lat: 51.645, lng: 4.8597 },
  { slug: "hoofddorp", label: "Hoofddorp", lat: 52.303, lng: 4.6889, aliases: ["haarlemmermeer"] },
  { slug: "rijswijk", label: "Rijswijk", lat: 52.0365, lng: 4.3247 },
  { slug: "barneveld", label: "Barneveld", lat: 52.1417, lng: 5.5883 },
  { slug: "weert", label: "Weert", lat: 51.251, lng: 5.7064 },
  { slug: "emmeloord", label: "Emmeloord", lat: 52.7107, lng: 5.748 },
];

// slug (incl. aliases) -> [lat, lng]
const COORDS = new Map<string, [number, number]>();
for (const c of NL_CITIES) {
  COORDS.set(c.slug, [c.lat, c.lng]);
  for (const a of c.aliases ?? []) COORDS.set(a, [c.lat, c.lng]);
}

/** Selectable origin cities for the alert form, alphabetical (Dutch collation). */
export const ORIGIN_CITIES: { slug: string; label: string }[] = NL_CITIES
  .map((c) => ({ slug: c.slug, label: c.label }))
  .sort((a, b) => a.label.localeCompare(b.label, "nl"));

/** Great-circle distance in kilometres between two lat/lng points. */
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** True when the slug is a place we have coordinates for (origin or alias). */
export function isKnownPlace(slug: string): boolean {
  return COORDS.has(slug);
}

/**
 * City slugs within `km` of the origin (inclusive of the origin), for use in a
 * `city_slug IN (...)` clause.
 *  - km <= 0          -> just the origin (exact place)
 *  - origin unknown   -> null (caller should fall back to an exact-match filter)
 */
export function citySlugsWithin(originSlug: string, km: number): string[] | null {
  const o = COORDS.get(originSlug);
  if (!o) return null;
  if (!(km > 0)) return [originSlug];
  const out: string[] = [];
  for (const c of NL_CITIES) {
    if (haversineKm(o[0], o[1], c.lat, c.lng) <= km) out.push(c.slug);
  }
  return out.length ? out : [originSlug];
}
