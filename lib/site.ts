export const SITE = {
  name: "Maakjobs",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://maakjobs.nl",
  tagline: "Dé vacaturebank voor techniek en de maakindustrie",
  description:
    "Hét vacatureplatform voor technici en de maakindustrie: werktuigbouw, elektrotechniek, installatie, onderhoud, engineering, mechatronica en productie. Dagelijks nieuwe technische vacatures.",
};

export const NAV = [
  { key: "jobs", href: "/vacatures" },
  { key: "companies", href: "/bedrijven" },
  { key: "salaries", href: "/inzichten/salarissen" },
  { key: "insights", href: "/inzichten" },
  { key: "employers", href: "/werkgevers" },
] as const;
