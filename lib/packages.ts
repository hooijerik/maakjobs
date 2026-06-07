// Paid placement packages. Single source of truth for the buyer-facing pricing copy
// and the employer form's package selector. Prices are display strings — set real
// amounts here when pricing is finalised (the MVP sells via quote/invoice, so the
// default is "Op aanvraag"). Dutch-only board, so copy lives inline (like taxonomy.ts).

export type PackageId = "standaard" | "premium" | "uitgelicht-bedrijf" | "combinatie";

export interface PremiumPackage {
  id: PackageId;
  name: string;
  price: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
}

export const PACKAGES: PremiumPackage[] = [
  {
    id: "standaard",
    name: "Standaard",
    price: "Gratis",
    blurb: "Je vacature op Maakjobs.",
    features: [
      "Plaatsing na controle",
      "Vindbaar in zoekresultaten, categorie- en locatiepagina's",
      "Mee in de vacature-alerts",
    ],
  },
  {
    id: "premium",
    name: "Premium vacature",
    price: "Op aanvraag",
    highlight: true,
    blurb: "Maximale zichtbaarheid voor één vacature.",
    features: [
      "Bovenaan de zoekresultaten met 'Uitgelicht'-badge",
      "Uitgelicht op de homepage",
      "Voorrang in de vacature-alerts",
      "30 dagen looptijd",
    ],
  },
  {
    id: "uitgelicht-bedrijf",
    name: "Uitgelicht bedrijf",
    price: "Op aanvraag",
    blurb: "Zet je bedrijf als werkgever op de kaart.",
    features: [
      "Logo bovenaan de bedrijvenpagina",
      "Uitgelicht op de homepage",
      "Employer-branding bij je vacatures",
    ],
  },
  {
    id: "combinatie",
    name: "Combinatie",
    price: "Op aanvraag",
    blurb: "Premium vacature én uitgelicht bedrijf, met voordeel.",
    features: ["Alles uit Premium vacature", "Alles uit Uitgelicht bedrijf", "Voordeeltarief"],
  },
];
