// Taxonomy + keyword dictionaries that drive classification and the UI.
// Keywords are lowercase. The classifier matches them with word boundaries.
// CATEGORIES are listed in CLASSIFICATION PRIORITY order (specific roles first,
// broad commercial roles last) - the first category whose keywords match wins.

import type { CategorySlug, SenioritySlug, WorkMode } from "./types";
import type { Locale } from "./i18n/config";

export interface CategoryDef {
  slug: CategorySlug;
  label: string; // Dutch UI label
  group: "Uitvoerend" | "Engineering" | "Productie" | "Overig";
  description: string; // Dutch, used on category landing pages
  keywords: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "mechatronica-proces",
    label: "Mechatronica & Procestechniek",
    group: "Engineering",
    description:
      "Mechatronica en procestechniek: van mechatronicus en PLC-programmeur tot procesoperator en industriële automatisering - de techniek waar mechanica, elektronica en software samenkomen.",
    keywords: [
      "mechatronica",
      "mechatronicus",
      "mechatronics",
      "mechatronisch",
      "procestechniek",
      "proces technicus",
      "procesoperator",
      "proces operator",
      "process operator",
      "plc",
      "plc programmeur",
      "plc-programmeur",
      "besturingstechnicus",
      "besturingstechniek",
      "industriële automatisering",
      "industriele automatisering",
      "industrial automation",
      "automatiseringstechnicus",
      "robotica",
      "robottechniek",
      "scada",
    ],
  },
  {
    slug: "elektrotechniek",
    label: "Elektrotechniek",
    group: "Uitvoerend",
    description:
      "Elektrotechniek: elektromonteurs, elektrotechnici, paneelbouwers en elektrotechnisch installateurs - alles rond installeren, aansluiten en onderhouden van elektrische installaties.",
    keywords: [
      "elektromonteur",
      "elektrotechnicus",
      "elektrotechniek",
      "elektrotechnisch",
      "elektricien",
      "electrician",
      "elektrotechnisch engineer",
      "paneelbouwer",
      "panel builder",
      "schakelkast",
      "schakeltechniek",
      "e-monteur",
      "middenspanning",
      "laagspanning",
      "elektrotechnisch installateur",
      "service monteur elektro",
    ],
  },
  {
    slug: "installatie-klimaat",
    label: "Installatie & Klimaattechniek",
    group: "Uitvoerend",
    description:
      "Installatie- en klimaattechniek: installateurs, cv- en koeltechnici, loodgieters en monteurs warmtepompen, ventilatie en sanitair.",
    keywords: [
      "installateur",
      "installatiemonteur",
      "installatie monteur",
      "cv-monteur",
      "cv monteur",
      "loodgieter",
      "koeltechniek",
      "koelmonteur",
      "koel monteur",
      "klimaattechniek",
      "klimaatinstallatie",
      "hvac",
      "warmtepomp",
      "warmtepomp monteur",
      "ventilatie",
      "ventilatiemonteur",
      "sanitair",
      "w-installateur",
      "werktuigkundig installateur",
      "airco",
      "service monteur installatie",
    ],
  },
  {
    slug: "onderhoud-service",
    label: "Onderhoud & Service",
    group: "Uitvoerend",
    description:
      "Onderhoud en service: onderhouds-, service- en storingsmonteurs en maintenance engineers die machines en installaties draaiend houden.",
    keywords: [
      "onderhoudsmonteur",
      "onderhouds monteur",
      "onderhoudstechnicus",
      "servicemonteur",
      "service monteur",
      "servicetechnicus",
      "service technicus",
      "service engineer",
      "storingsmonteur",
      "storingsdienst",
      "maintenance technician",
      "maintenance engineer",
      "onderhoudsengineer",
      "field service",
      "field service engineer",
      "buitendienstmonteur",
      "buitendienst monteur",
      "reliability engineer",
    ],
  },
  {
    slug: "werktuigbouw",
    label: "Werktuigbouw & Mechanical",
    group: "Uitvoerend",
    description:
      "Werktuigbouw en mechanical: van lasser, CNC-verspaner en bankwerker tot werktuigbouwkundig engineer - het vakmanschap achter machines en constructies.",
    keywords: [
      "werktuigbouwkundige",
      "werktuigbouwkundig",
      "werktuigbouw",
      "mechanical engineer",
      "mechanical technician",
      "machinebouw",
      "machinebouwer",
      "bankwerker",
      "constructiebankwerker",
      "lasser",
      "lassen",
      "welder",
      "welding",
      "plaatwerker",
      "plaatbewerker",
      "cnc",
      "cnc operator",
      "cnc verspaner",
      "verspaner",
      "verspaning",
      "draaier frezer",
      "constructiewerker",
      "fijnmechanisch",
      "pijpfitter",
      "fitter",
    ],
  },
  {
    slug: "engineering",
    label: "Engineering & Werkvoorbereiding",
    group: "Engineering",
    description:
      "Engineering en werkvoorbereiding: constructeurs, werkvoorbereiders, technisch tekenaars en design engineers die het technische ontwerp en de voorbereiding verzorgen.",
    keywords: [
      "constructeur",
      "werkvoorbereider",
      "werkvoorbereiding",
      "technisch tekenaar",
      "tekenaar constructeur",
      "calculator",
      "design engineer",
      "project engineer",
      "r&d engineer",
      "productontwikkelaar",
      "product engineer",
      "cad engineer",
      "cad tekenaar",
      "mechanical designer",
      "technisch ontwerper",
      "lead engineer",
      "engineering manager",
    ],
  },
  {
    slug: "productie-montage",
    label: "Productie & Montage",
    group: "Productie",
    description:
      "Productie en montage: productiemedewerkers, machineoperators, assemblage- en montagemedewerkers in de maakindustrie.",
    keywords: [
      "productiemedewerker",
      "productie medewerker",
      "productiemedewerker techniek",
      "assemblage",
      "assemblagemedewerker",
      "assemblage medewerker",
      "montagemedewerker",
      "montage medewerker",
      "monteur assemblage",
      "machineoperator",
      "machine operator",
      "productieoperator",
      "fabricage",
      "samensteller",
    ],
  },
  {
    // Catch-all for technical roles that don't match a specific category.
    // Empty keywords on purpose: classify() assigns this as a fallback, it is
    // never matched by detectCategory. Kept out of the featured pill rows (home/footer).
    slug: "overig-techniek",
    label: "Overig Techniek",
    group: "Overig",
    description:
      "Overige technische functies: technische rollen die niet in een van de hoofdcategorieën vallen.",
    keywords: [],
  },
];

/** Hard exclusions: if NO technical category matched and one of these is in the title, drop the job.
 *  Rejects office/IT/commercial/medical roles. NOTE: "monteur"/"technicus"/"engineer" are NOT here -
 *  they are the core of this board (the parent GTM board excluded them; here they are includes). */
export const HARD_EXCLUDE_KEYWORDS = [
  // software / IT
  "software engineer",
  "software developer",
  "software ontwikkelaar",
  "backend developer",
  "frontend developer",
  "full stack",
  "fullstack",
  "full-stack",
  "devops",
  "site reliability",
  "data engineer",
  "data scientist",
  "data analist",
  "machine learning",
  "qa engineer",
  "developer",
  "systeembeheerder",
  "system administrator",
  "scrum master",
  "software architect",
  "cloud engineer",
  // commercieel / kantoor
  "sales",
  "account manager",
  "accountmanager",
  "marketing",
  "recruiter",
  "recruitment",
  "talent acquisition",
  "human resources",
  "office manager",
  "secretaresse",
  "administratief medewerker",
  "klantenservice",
  "customer service",
  "callcenter",
  // finance / legal
  "accountant",
  "boekhouder",
  "controller",
  "finance manager",
  "financieel",
  "jurist",
  "legal",
  // design / medisch / onderwijs / overig niet-technisch
  "ux designer",
  "ui designer",
  "grafisch",
  "verpleegkundige",
  "verzorgende",
  "docent",
  "leraar",
  "chauffeur",
  "bezorger",
  "schoonmaker",
  "schoonmaak",
  "beveiliger",
  "horeca",
  "warehouse",
  "magazijnmedewerker",
  "logistiek medewerker",
  "heftruckchauffeur",
];

/** Broad technical relevance signals - used to keep an unclassified role that is clearly technical. */
export const TECH_SIGNAL_KEYWORDS = [
  "technicus",
  "technician",
  "monteur",
  "engineer",
  "installateur",
  "installatie",
  "onderhoud",
  "maintenance",
  "werktuigbouw",
  "mechanical",
  "elektrotechniek",
  "elektro",
  "mechatronica",
  "procestechniek",
  "lassen",
  "lasser",
  "montage",
  "machinebouw",
  "constructie",
  "werkvoorbereider",
  "cnc",
  "verspaning",
  "plc",
  "tekenaar",
  "constructeur",
];

export interface SeniorityDef {
  slug: SenioritySlug;
  label: string;
  labelEn?: string;
  order: number;
  keywords: string[];
}

// Technical / maakindustrie seniority. Checked from most senior to least; first match wins.
export const SENIORITY: SeniorityDef[] = [
  {
    slug: "leidinggevend",
    label: "Uitvoerder / Manager",
    order: 6,
    keywords: [
      "uitvoerder",
      "werkmeester",
      "bedrijfsleider",
      "vestigingsmanager",
      "vestigingsleider",
      "manager",
      "afdelingshoofd",
      "hoofd",
      "leidinggevend",
      "directeur",
      "director",
      "head of",
    ],
  },
  {
    slug: "voorman",
    label: "Voorman / Teamleider",
    order: 5,
    keywords: [
      "voorman",
      "meewerkend voorman",
      "teamleider",
      "ploegleider",
      "hoofdmonteur",
      "team lead",
      "teamlead",
    ],
  },
  {
    slug: "senior",
    label: "Senior",
    order: 4,
    keywords: [
      "senior",
      "sr",
      "eerste monteur",
      "1e monteur",
      "specialist",
      "lead engineer",
      "lead",
      "principal",
      "expert",
    ],
  },
  {
    slug: "allround",
    label: "Allround",
    order: 3,
    keywords: ["allround", "all-round", "all round", "ervaren", "medior", "gevorderd"],
  },
  {
    slug: "junior",
    label: "Junior",
    order: 2,
    keywords: ["junior", "jr", "beginnend"],
  },
  {
    slug: "leerling",
    label: "Leerling / Starter",
    order: 1,
    keywords: [
      "leerling",
      "aankomend",
      "bbl",
      "stagiair",
      "stagiaire",
      "stage",
      "afstudeer",
      "afstuderen",
      "trainee",
      "starter",
      "instromer",
      "zij-instroom",
      "zij-instromer",
      "werkstudent",
      "entry",
    ],
  },
];

export interface WorkModeDef {
  slug: WorkMode;
  label: string;
  labelEn?: string;
  keywords: string[];
}

export const WORK_MODES: WorkModeDef[] = [
  {
    slug: "remote",
    label: "Remote",
    keywords: [
      "remote",
      "fully remote",
      "remote-first",
      "remote first",
      "work from home",
      "thuiswerken",
      "op afstand",
      "anywhere",
    ],
  },
  {
    slug: "hybrid",
    label: "Hybride",
    labelEn: "Hybrid",
    keywords: ["hybrid", "hybride", "flexible working", "flexibel werken"],
  },
  {
    slug: "onsite",
    label: "Op kantoor",
    labelEn: "On-site",
    keywords: ["on-site", "on site", "onsite", "op kantoor", "office-based", "kantoor"],
  },
];

// 12 Dutch provinces + the 5 Flemish provinces and Brussels (Dutch-speaking Belgium).
export const PROVINCES = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
  "Antwerpen",
  "Oost-Vlaanderen",
  "West-Vlaanderen",
  "Vlaams-Brabant",
  "Limburg (België)",
  "Brussel",
] as const;

// Major NL cities -> province. Keys are lowercase.
export const CITY_PROVINCE: Record<string, string> = {
  amsterdam: "Noord-Holland",
  haarlem: "Noord-Holland",
  hilversum: "Noord-Holland",
  alkmaar: "Noord-Holland",
  zaandam: "Noord-Holland",
  hoofddorp: "Noord-Holland",
  amstelveen: "Noord-Holland",
  rotterdam: "Zuid-Holland",
  "den haag": "Zuid-Holland",
  "the hague": "Zuid-Holland",
  "'s-gravenhage": "Zuid-Holland",
  leiden: "Zuid-Holland",
  delft: "Zuid-Holland",
  zoetermeer: "Zuid-Holland",
  dordrecht: "Zuid-Holland",
  gouda: "Zuid-Holland",
  utrecht: "Utrecht",
  amersfoort: "Utrecht",
  nieuwegein: "Utrecht",
  veenendaal: "Utrecht",
  eindhoven: "Noord-Brabant",
  tilburg: "Noord-Brabant",
  breda: "Noord-Brabant",
  "den bosch": "Noord-Brabant",
  "'s-hertogenbosch": "Noord-Brabant",
  helmond: "Noord-Brabant",
  groningen: "Groningen",
  leeuwarden: "Friesland",
  assen: "Drenthe",
  emmen: "Drenthe",
  zwolle: "Overijssel",
  enschede: "Overijssel",
  deventer: "Overijssel",
  hengelo: "Overijssel",
  arnhem: "Gelderland",
  nijmegen: "Gelderland",
  apeldoorn: "Gelderland",
  ede: "Gelderland",
  almere: "Flevoland",
  lelystad: "Flevoland",
  maastricht: "Limburg",
  venlo: "Limburg",
  heerlen: "Limburg",
  sittard: "Limburg",
  middelburg: "Zeeland",
};

// Flemish + Brussels cities -> region (Dutch-speaking Belgium). Keys lowercase, NL + EN spellings.
export const BE_CITY_PROVINCE: Record<string, string> = {
  antwerpen: "Antwerpen",
  antwerp: "Antwerpen",
  mechelen: "Antwerpen",
  turnhout: "Antwerpen",
  gent: "Oost-Vlaanderen",
  ghent: "Oost-Vlaanderen",
  aalst: "Oost-Vlaanderen",
  "sint-niklaas": "Oost-Vlaanderen",
  brugge: "West-Vlaanderen",
  bruges: "West-Vlaanderen",
  kortrijk: "West-Vlaanderen",
  roeselare: "West-Vlaanderen",
  oostende: "West-Vlaanderen",
  ostend: "West-Vlaanderen",
  leuven: "Vlaams-Brabant",
  louvain: "Vlaams-Brabant",
  vilvoorde: "Vlaams-Brabant",
  zaventem: "Vlaams-Brabant",
  hasselt: "Limburg (België)",
  genk: "Limburg (België)",
  brussel: "Brussel",
  brussels: "Brussel",
  bruxelles: "Brussel",
};


export const COMPANY_SIZES = ["Startup", "Scale-up", "Mid-Market", "Enterprise"] as const;

// Lookups
export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
export const SENIORITY_BY_SLUG = new Map(SENIORITY.map((s) => [s.slug, s]));
export const WORKMODE_BY_SLUG = new Map(WORK_MODES.map((w) => [w.slug, w]));
function pickLabel(def: { label: string } | undefined): string | undefined {
  return def?.label;
}
export function categoryLabel(slug: string, _locale: Locale = "nl"): string {
  return pickLabel(CATEGORY_BY_SLUG.get(slug as CategorySlug)) ?? "Overig Techniek";
}
export function categoryDescription(slug: string, _locale: Locale = "nl"): string {
  return CATEGORY_BY_SLUG.get(slug as CategorySlug)?.description ?? "";
}
export function seniorityLabel(slug: string | null, _locale: Locale = "nl"): string {
  if (!slug) return "-";
  return pickLabel(SENIORITY_BY_SLUG.get(slug as SenioritySlug)) ?? "-";
}
export function workModeLabel(slug: string | null, _locale: Locale = "nl"): string {
  if (!slug) return "-";
  return pickLabel(WORKMODE_BY_SLUG.get(slug as WorkMode)) ?? "-";
}
