// Legal copy for Maakjobs: advertentievoorwaarden, privacyverklaring, cookieverklaring.
// Dutch-only board, so the text lives inline (like taxonomy.ts / packages.ts). The
// advertentievoorwaarden mirror the GTM AI house terms (gtmbanen.nl/advertentievoorwaarden),
// adapted for Maakjobs. Have them checked by a jurist before relying on them commercially.
import { SITE } from "./site";

/** Operator / data-controller details (GTM AI, the company behind Maakjobs). */
export const LEGAL = {
  brand: SITE.name, // "Maakjobs"
  operator: "GTM AI",
  email: "info@gtmai.nl",
  kvk: "97159751",
  btw: "NL867933914B01",
  address: "Willibrordweg 18, 3911 CC Rhenen",
  updated: "juni 2026",
};

export interface LegalSection {
  h: string;
  body?: string[];
  list?: string[];
}
export interface LegalDoc {
  slug: "advertentievoorwaarden" | "privacy" | "cookies";
  title: string;
  intro: string[];
  sections: LegalSection[];
}

const A = LEGAL;

export const ADVERTENTIEVOORWAARDEN: LegalDoc = {
  slug: "advertentievoorwaarden",
  title: "Advertentievoorwaarden",
  intro: [
    `Deze voorwaarden gelden voor elke betaalde plaatsing op ${A.brand} (maakjobs.nl), een dienst van ${A.operator}, KvK ${A.kvk}, BTW ${A.btw}, ${A.address}.`,
    `Versie ${A.updated}.`,
  ],
  sections: [
    {
      h: "1. Definities",
      body: [
        `"${A.brand}" is de vacaturebank op maakjobs.nl, een dienst van ${A.operator}, KvK ${A.kvk}, BTW ${A.btw}, ${A.address}. "Adverteerder" is de partij die een betaalde plaatsing afneemt. "Plaatsing" is een premium vacature en/of een uitgelicht bedrijfsprofiel.`,
      ],
    },
    {
      h: "2. Toepasselijkheid",
      body: [
        "Deze voorwaarden zijn van toepassing op elke betaalde plaatsing en gaan vóór eventuele inkoop- of advertentievoorwaarden van de adverteerder.",
      ],
    },
    {
      h: "3. Totstandkoming",
      body: [
        `Een overeenkomst komt tot stand na schriftelijke bevestiging of offerte door ${A.brand} en akkoord van de adverteerder. Een plaatsing start na ontvangst van betaling, tenzij schriftelijk anders is afgesproken.`,
      ],
    },
    {
      h: "4. Tarieven & betaling",
      body: [
        `Prijzen zijn in euro's en exclusief 21% btw. Voor zakelijke afnemers in België wordt de btw verlegd (intracommunautaire dienst). De betaaltermijn is 14 dagen. Bij niet-tijdige betaling mag ${A.brand} de plaatsing opschorten of verwijderen.`,
      ],
    },
    {
      h: "5. Looptijd",
      body: [
        "De plaatsing loopt gedurende de overeengekomen periode (bijvoorbeeld 30 of 60 dagen, of per maand/kwartaal/jaar) en eindigt daarna automatisch. Verlenging gebeurt op aanvraag tegen het dan geldende tarief.",
      ],
    },
    {
      h: "6. Inhoud & verantwoordelijkheid",
      body: [
        "De adverteerder staat in voor de juistheid en rechtmatigheid van de aangeleverde inhoud (vacaturetekst, logo, banner) en garandeert dat het om echte, actuele vacatures gaat en dat hij over de benodigde rechten beschikt. Inhoud mag niet misleidend, discriminerend of in strijd met de wet zijn.",
      ],
    },
    {
      h: "7. Redactioneel recht",
      body: [
        `${A.brand} mag plaatsingen weigeren, redactioneel inkorten of verwijderen die niet passen bij het technische / maakindustrie-profiel van het platform of die in strijd zijn met deze voorwaarden, zonder restitutieplicht bij schending door de adverteerder.`,
      ],
    },
    {
      h: "8. Geen resultaatsgarantie",
      body: [
        `${A.brand} spant zich in voor zichtbaarheid, maar geeft geen garantie op een aantal weergaven, kliks of sollicitanten.`,
      ],
    },
    {
      h: "9. Annulering & restitutie",
      body: [
        "Annuleren kan kosteloos tot publicatie. Na publicatie is geen restitutie mogelijk, omdat de dienst dan is geleverd.",
      ],
    },
    {
      h: "10. Beschikbaarheid",
      body: [
        `${A.brand} streeft naar continue beschikbaarheid maar is niet aansprakelijk voor tijdelijke onderbrekingen of overmacht. Dagen die door een storing verloren gaan, worden waar redelijk gecompenseerd in looptijd.`,
      ],
    },
    {
      h: "11. Aansprakelijkheid",
      body: [
        `De aansprakelijkheid van ${A.brand} is beperkt tot het voor de betreffende plaatsing betaalde bedrag. Indirecte of gevolgschade is uitgesloten.`,
      ],
    },
    {
      h: "12. Privacy & transparantie",
      body: [
        'Persoonsgegevens worden verwerkt conform het privacy- en cookiebeleid. Betaalde plaatsingen worden herkenbaar gelabeld als "Uitgelicht".',
      ],
    },
    {
      h: "13. Toepasselijk recht",
      body: [
        "Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter van de Rechtbank Midden-Nederland.",
      ],
    },
    {
      h: "Vragen?",
      body: [`Vragen over deze voorwaarden? Mail ${A.email}.`],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacyverklaring",
  intro: [
    `${A.brand} respecteert je privacy en verwerkt persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). Deze verklaring legt uit welke gegevens we verwerken, waarom en wat je rechten zijn.`,
    `Laatst bijgewerkt: ${A.updated}.`,
  ],
  sections: [
    {
      h: "1. Verwerkingsverantwoordelijke",
      body: [
        `${A.operator} (handelsnaam ${A.brand}), KvK ${A.kvk}, BTW ${A.btw}, ${A.address}. Vragen over privacy? Mail naar ${A.email}.`,
      ],
    },
    {
      h: "2. Welke gegevens we verwerken en waarom",
      list: [
        "Vacature-alerts: je e-mailadres en gekozen filters, om je de gevraagde alerts te sturen. Grondslag: jouw toestemming. Je kunt je altijd uitschrijven.",
        "Werkgevers-inzendingen: bedrijfsnaam, contact-e-mail en vacaturegegevens, om je aanvraag te behandelen en contact op te nemen. Grondslag: uitvoering van de overeenkomst en/of gerechtvaardigd belang.",
        "Premium-plaatsingen en facturatie: bedrijfs- en factuurgegevens, om de overeenkomst uit te voeren en te voldoen aan onze administratie- en bewaarplicht. Grondslag: uitvoering overeenkomst en wettelijke verplichting.",
        "Vacaturegegevens uit openbare bronnen: vacatures worden verzameld uit openbare bronnen en ATS-systemen. Deze bevatten doorgaans geen persoonsgegevens van sollicitanten; soms een contactpersoon. Grondslag: gerechtvaardigd belang. Verwijdering kan op verzoek.",
        "Websitegebruik (analytics): geanonimiseerde gebruiksstatistieken om de website te verbeteren. Google Analytics is altijd actief; Microsoft Clarity plaatsen we alleen met jouw toestemming via cookies.",
      ],
    },
    {
      h: "3. Cookies",
      body: [
        `${A.brand} gebruikt noodzakelijke cookies en Google Analytics, en — na jouw toestemming — Microsoft Clarity. Welke cookies dat zijn, lees je in de cookieverklaring (${SITE.url}/cookies).`,
      ],
    },
    {
      h: "4. Ontvangers en verwerkers",
      body: ["We delen gegevens alleen met dienstverleners die voor ons gegevens verwerken, op basis van een verwerkersovereenkomst:"],
      list: [
        "Resend — verzenden van e-mails (alerts en bevestigingen).",
        "Google Ireland Ltd. — Google Analytics 4 (websitestatistieken).",
        "Microsoft Ireland — Microsoft Clarity (gebruiksstatistieken), alleen na toestemming.",
        "Stripe — verwerking van online betalingen voor premium-plaatsingen (indien van toepassing).",
        "Onze hostingpartner — het draaien en opslaan van de applicatie en database.",
      ],
    },
    {
      h: "5. Doorgifte buiten de EER",
      body: [
        "Sommige dienstverleners (zoals Google, Microsoft en Stripe) kunnen gegevens buiten de Europese Economische Ruimte verwerken. In dat geval zorgen we voor passende waarborgen, zoals de modelcontractbepalingen (SCC's) van de Europese Commissie.",
      ],
    },
    {
      h: "6. Bewaartermijnen",
      list: [
        "Alert-abonnementen: tot je je uitschrijft.",
        "Werkgevers-inzendingen: zolang nodig voor de afhandeling en daarna voor zover relevant voor de relatie.",
        "Facturen en administratie: 7 jaar (wettelijke fiscale bewaarplicht).",
        "Analytics: conform de bewaarinstellingen van de betreffende dienst.",
      ],
    },
    {
      h: "7. Jouw rechten",
      body: [
        `Je hebt recht op inzage, correctie, verwijdering, beperking, bezwaar en overdraagbaarheid van je gegevens, en je mag een gegeven toestemming altijd intrekken. Stuur je verzoek naar ${A.email}. Je hebt ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).`,
      ],
    },
    {
      h: "8. Beveiliging",
      body: [
        "We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen, waaronder versleutelde verbindingen (HTTPS) en beperkte toegang.",
      ],
    },
    {
      h: "9. Wijzigingen",
      body: [`We kunnen deze privacyverklaring aanpassen. De actuele versie staat op ${SITE.url}/privacy.`],
    },
  ],
};

export const COOKIES: LegalDoc = {
  slug: "cookies",
  title: "Cookieverklaring",
  intro: [
    `${A.brand} gebruikt cookies en vergelijkbare technieken. Noodzakelijke cookies en Google Analytics zijn altijd actief; aanvullende analytische cookies (Microsoft Clarity) plaatsen we alleen met jouw toestemming.`,
    `Laatst bijgewerkt: ${A.updated}.`,
  ],
  sections: [
    {
      h: "1. Wat zijn cookies?",
      body: [
        "Cookies zijn kleine bestandjes die bij een websitebezoek op je apparaat worden opgeslagen. Ze worden gebruikt om de site te laten werken en om geanonimiseerd te meten hoe de site wordt gebruikt.",
      ],
    },
    {
      h: "2. Altijd actieve cookies",
      body: [
        "Deze cookies zijn nodig om de site te laten werken en om het basisgebruik te meten; ze staan altijd aan.",
      ],
      list: [
        "mj_consent — onthoudt je cookiekeuze (bewaartermijn ca. 6 maanden).",
        "mj_admin — alleen voor de beheerder, om ingelogd te blijven in het beheer.",
        "Google Analytics 4 (_ga, _ga_*) — geanonimiseerde bezoekstatistieken om de site te verbeteren. Bewaartermijn tot 2 jaar. Zie het privacybeleid van Google.",
      ],
    },
    {
      h: "3. Cookies die we pas na toestemming plaatsen",
      body: ["Deze plaatsen we alleen nadat je op 'Accepteren' hebt geklikt."],
      list: [
        "Microsoft Clarity (_clck, _clsk, CLID, ANONCHK) — gebruiksstatistieken en heatmaps. Zie het privacybeleid van Microsoft.",
      ],
    },
    {
      h: "4. Je toestemming beheren",
      body: [
        "Je kunt je keuze op elk moment aanpassen via de knop 'Cookievoorkeuren' onderaan elke pagina. Daarnaast kun je cookies beheren of verwijderen via de instellingen van je browser.",
      ],
    },
    {
      h: "5. Wijzigingen",
      body: [`We kunnen deze cookieverklaring aanpassen. De actuele versie staat op ${SITE.url}/cookies.`],
    },
  ],
};

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  advertentievoorwaarden: ADVERTENTIEVOORWAARDEN,
  privacy: PRIVACY,
  cookies: COOKIES,
};
