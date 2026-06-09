// Legal copy for Maakjobs: algemene voorwaarden, privacyverklaring, cookieverklaring.
// Dutch-only board, so the text lives inline (like taxonomy.ts / packages.ts). These are
// solid templates — have them checked by a jurist and fill in the LEGAL placeholders
// (KvK, BTW, adres) before relying on them commercially.
import { SITE } from "./site";

/** Operator / data-controller details. Fill in the bracketed placeholders. */
export const LEGAL = {
  brand: SITE.name, // "Maakjobs"
  operator: "GTM AI", // handelsnaam van de exploitant — controleer/pas aan
  email: "info@gtmai.nl",
  kvk: "[KvK-nummer]",
  btw: "[BTW-identificatienummer]",
  address: "[Vestigingsadres]",
  updated: "8 juni 2026",
};

export interface LegalSection {
  h: string;
  body?: string[];
  list?: string[];
}
export interface LegalDoc {
  slug: "voorwaarden" | "privacy" | "cookies";
  title: string;
  intro: string[];
  sections: LegalSection[];
}

const A = LEGAL;

export const VOORWAARDEN: LegalDoc = {
  slug: "voorwaarden",
  title: "Algemene voorwaarden",
  intro: [
    `Deze algemene voorwaarden zijn van toepassing op het gebruik van ${A.brand} (${SITE.url}), een vacatureplatform voor techniek en de maakindustrie, geëxploiteerd door ${A.operator} (KvK ${A.kvk}, BTW ${A.btw}), hierna "${A.brand}".`,
    `Laatst bijgewerkt: ${A.updated}.`,
  ],
  sections: [
    {
      h: "1. Definities",
      list: [
        `${A.brand}: het vacatureplatform en de daarbij horende diensten.`,
        "Bezoeker: iedere gebruiker die de website bezoekt of een vacature-alert instelt.",
        "Werkgever / Adverteerder: een (rechts)persoon die een vacature aanbiedt of een premium-plaatsing afneemt.",
        "Vacature: een vacaturevermelding op het platform.",
        "Premium-plaatsing: een betaalde, uitgelichte vacature- of bedrijfsplaatsing.",
      ],
    },
    {
      h: "2. Toepasselijkheid",
      body: [
        `Deze voorwaarden gelden voor elk gebruik van ${A.brand} en voor elke overeenkomst met een Adverteerder. Afwijkingen gelden alleen als ze schriftelijk zijn overeengekomen. Inkoop- of andere voorwaarden van de Adverteerder worden uitdrukkelijk van de hand gewezen.`,
      ],
    },
    {
      h: "3. De dienst",
      body: [
        `${A.brand} is een vacaturebank. Een deel van de vacatures wordt geautomatiseerd verzameld uit openbare bronnen en vacaturesystemen (ATS) van werkgevers; daarnaast kunnen werkgevers zelf vacatures aanleveren. ${A.brand} bemiddelt niet bij arbeid en is geen partij bij sollicitaties, arbeidsovereenkomsten of afspraken tussen Bezoeker en Werkgever.`,
        `${A.brand} spant zich in voor een actueel en correct aanbod, maar staat niet in voor de juistheid, volledigheid of beschikbaarheid van vacatures van derden.`,
      ],
    },
    {
      h: "4. Gratis plaatsing",
      body: [
        `De standaardplaatsing van een vacature is gratis. ${A.brand} beoordeelt elke aanlevering en mag zonder opgaaf van reden een vacature weigeren, aanpassen of verwijderen, bijvoorbeeld bij onjuiste, misleidende, discriminerende of onrechtmatige inhoud, of bij vacatures die niet binnen de niche (techniek/maakindustrie) passen.`,
      ],
    },
    {
      h: "5. Premium-plaatsingen (betaald)",
      body: [
        "Een premium-plaatsing geeft extra zichtbaarheid (zoals een uitgelichte positie en/of vermelding op de homepage) gedurende de overeengekomen looptijd. De inhoud en looptijd staan in het aanbod of de offerte.",
        "Tarieven zijn op aanvraag en worden vooraf per offerte bevestigd. Genoemde bedragen zijn exclusief btw, tenzij anders vermeld. Facturatie verloopt per factuur met de wettelijke betaaltermijn van 14 dagen, tenzij anders overeengekomen. Online betalingen verlopen, indien aangeboden, via onze betaaldienstverlener Stripe.",
        `Een premium-plaatsing gaat in na ontvangst van betaling of na schriftelijke bevestiging. Bij niet-tijdige betaling mag ${A.brand} de plaatsing opschorten of beëindigen.`,
      ],
    },
    {
      h: "6. Annulering en terugbetaling",
      body: [
        "Overeenkomsten met Adverteerders zijn zakelijke overeenkomsten (B2B); het wettelijke herroepingsrecht voor consumenten is niet van toepassing. Een reeds gestarte premium-plaatsing wordt niet terugbetaald. Annulering vóór aanvang kan kosteloos schriftelijk, mits de plaatsing nog niet live staat.",
        `Wordt een plaatsing door toedoen van ${A.brand} niet (volledig) geleverd, dan wordt het betrokken bedrag naar rato gecrediteerd.`,
      ],
    },
    {
      h: "7. Verplichtingen van de Adverteerder",
      body: [
        "De Adverteerder staat ervoor in dat aangeleverde vacatures juist en niet misleidend zijn, voldoen aan toepasselijke wet- en regelgeving (waaronder gelijke-behandelingswetgeving) en geen inbreuk maken op rechten van derden. De Adverteerder beschikt over de benodigde rechten op aangeleverde teksten, logo's en beeldmateriaal en verleent ${A.brand} het recht deze voor de plaatsing te gebruiken.",
      ],
    },
    {
      h: "8. Intellectueel eigendom",
      body: [
        `Alle rechten op het platform, de vormgeving, de classificatie en samengestelde overzichten berusten bij ${A.brand}. Zonder voorafgaande schriftelijke toestemming mag de inhoud niet systematisch worden overgenomen, geschraapt of hergebruikt.`,
      ],
    },
    {
      h: "9. Aansprakelijkheid",
      body: [
        `${A.brand} is niet aansprakelijk voor schade die voortvloeit uit het gebruik van het platform of uit (de inhoud van) vacatures van derden, behoudens opzet of bewuste roekeloosheid. Iedere aansprakelijkheid is beperkt tot het bedrag dat de Adverteerder in de betreffende overeenkomst heeft betaald. ${A.brand} is nooit aansprakelijk voor indirecte schade of gevolgschade.`,
      ],
    },
    {
      h: "10. Melding en verwijdering",
      body: [
        `Vind je dat een vacature onjuist of onrechtmatig is, of staan jouw gegevens ten onrechte in een vacature? Meld dit via ${A.email}; ${A.brand} verwijdert of corrigeert onrechtmatige of onjuiste content zo snel mogelijk.`,
      ],
    },
    {
      h: "11. Privacy",
      body: [
        "Op de verwerking van persoonsgegevens is de privacyverklaring van toepassing. Het gebruik van cookies staat beschreven in de cookieverklaring.",
      ],
    },
    {
      h: "12. Wijzigingen",
      body: [
        `${A.brand} mag deze voorwaarden wijzigen. De actuele versie staat altijd op ${SITE.url}/voorwaarden. Op lopende overeenkomsten gelden de voorwaarden zoals die bij het sluiten golden.`,
      ],
    },
    {
      h: "13. Toepasselijk recht",
      body: [
        `Op deze voorwaarden en alle overeenkomsten is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement van de vestigingsplaats van ${A.operator}.`,
      ],
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
        `${A.operator} (handelsnaam ${A.brand}), KvK ${A.kvk}, ${A.address}. Vragen over privacy? Mail naar ${A.email}.`,
      ],
    },
    {
      h: "2. Welke gegevens we verwerken en waarom",
      list: [
        "Vacature-alerts: je e-mailadres en gekozen filters, om je de gevraagde alerts te sturen. Grondslag: jouw toestemming. Je kunt je altijd uitschrijven.",
        "Werkgevers-inzendingen: bedrijfsnaam, contact-e-mail en vacaturegegevens, om je aanvraag te behandelen en contact op te nemen. Grondslag: uitvoering van de overeenkomst en/of gerechtvaardigd belang.",
        "Premium-plaatsingen en facturatie: bedrijfs- en factuurgegevens, om de overeenkomst uit te voeren en te voldoen aan onze administratie- en bewaarplicht. Grondslag: uitvoering overeenkomst en wettelijke verplichting.",
        "Vacaturegegevens uit openbare bronnen: vacatures worden verzameld uit openbare bronnen en ATS-systemen. Deze bevatten doorgaans geen persoonsgegevens van sollicitanten; soms een contactpersoon. Grondslag: gerechtvaardigd belang. Verwijdering kan op verzoek.",
        "Websitegebruik (analytics): geanonimiseerde/gepseudonimiseerde gebruiksstatistieken om de website te verbeteren. Grondslag: jouw toestemming via cookies.",
      ],
    },
    {
      h: "3. Cookies",
      body: [
        `${A.brand} gebruikt functionele en — na jouw toestemming — analytische cookies. Welke cookies dat zijn, lees je in de cookieverklaring (${SITE.url}/cookies).`,
      ],
    },
    {
      h: "4. Ontvangers en verwerkers",
      body: ["We delen gegevens alleen met dienstverleners die voor ons gegevens verwerken, op basis van een verwerkersovereenkomst:"],
      list: [
        "Resend — verzenden van e-mails (alerts en bevestigingen).",
        "Google Ireland Ltd. — Google Analytics 4 (websitestatistieken), alleen na toestemming.",
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
      body: [
        `We kunnen deze privacyverklaring aanpassen. De actuele versie staat op ${SITE.url}/privacy.`,
      ],
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
  voorwaarden: VOORWAARDEN,
  privacy: PRIVACY,
  cookies: COOKIES,
};
