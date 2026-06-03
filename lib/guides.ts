import type { Locale } from "./i18n/config";

export interface GuideSection {
  h?: string;
  p: string;
}
export interface Guide {
  slug: string;
  title: string;
  dek: string;
  updated: string;
  sections: GuideSection[];
}

// Dutch-only career guides for the technical / maakindustrie audience.
export const GUIDES: Guide[] = [
  {
    slug: "wat-verdient-een-werktuigbouwkundige",
    title: "Wat verdient een werktuigbouwkundige in Nederland?",
    dek: "Salarisindicaties voor werktuigbouwkundigen en monteurs, en de factoren die je beloning bepalen.",
    updated: "juni 2026",
    sections: [
      {
        p: "Wat je verdient als werktuigbouwkundige hangt sterk af van je niveau (MBO, HBO of WO), je ervaring, de sector en je regio. Een startende monteur zit doorgaans onderaan de schaal, terwijl een ervaren werktuigbouwkundig engineer of werkvoorbereider fors meer verdient.",
      },
      {
        h: "Wat bepaalt je salaris?",
        p: "De belangrijkste factoren zijn opleidingsniveau, jaren ervaring, specialisatie (bijvoorbeeld lassen, CNC of engineering), of je in loondienst of via detachering werkt, en de regio. In de Randstad en rond technische clusters als Eindhoven liggen de salarissen vaak iets hoger.",
      },
      {
        h: "Bekijk de actuele cijfers",
        p: "In het Maakjobs Salarisrapport vind je mediane salarisranges per functie en niveau, gebaseerd op echte vacatures. Zo benchmark je eenvoudig je volgende stap.",
      },
    ],
  },
  {
    slug: "vca-wat-is-het",
    title: "VCA: wat is het en heb je het nodig?",
    dek: "Het veiligheidscertificaat dat veel technische werkgevers verplicht stellen - wat het is en hoe je het haalt.",
    updated: "juni 2026",
    sections: [
      {
        p: "VCA staat voor Veiligheid, Gezondheid en Milieu Checklist Aannemers. Het is een certificaat dat aantoont dat je de basis van veilig werken kent. Voor veel technische functies - zeker in de installatie, onderhoud en op bouwlocaties - is een geldig VCA-diploma een harde eis.",
      },
      {
        h: "Welke variant heb je nodig?",
        p: "Er zijn twee veelvoorkomende varianten: VCA Basis (B-VCA) voor uitvoerende medewerkers, en VCA VOL (Veiligheid voor Operationeel Leidinggevenden) voor leidinggevenden en werkvoorbereiders. Welke je nodig hebt, hangt af van je rol.",
      },
      {
        h: "Hoe haal je het?",
        p: "Je haalt VCA via een examen bij een erkend exameninstituut, vaak na een korte cursus van een of twee dagen. Het diploma is tien jaar geldig. Veel werkgevers vergoeden de cursus of bieden hem intern aan.",
      },
    ],
  },
];

export function guidesFor(_locale: Locale): Guide[] {
  return GUIDES;
}
export function guideBySlug(_locale: Locale, slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
export function guideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
