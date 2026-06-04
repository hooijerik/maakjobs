// Lightweight test runner (no framework). Run with: npm test
import {
  classify,
  detectCategory,
  detectSeniority,
  detectWorkMode,
  detectLocation,
  detectAI,
  parseSalary,
  detectTextLanguage,
} from "../lib/classify";
import type { RawJob } from "../lib/types";

let pass = 0;
const fails: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) pass++;
  else fails.push(name);
}
function eq<T>(name: string, got: T, want: T) {
  check(`${name} → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`, got === want);
}
function job(title: string, extra: Partial<RawJob> = {}): RawJob {
  return { source: "greenhouse", sourceId: "x", companyName: "Acme", title, url: "https://x", ...extra };
}

// ---- category ----
eq("lasser", detectCategory("Ervaren Lasser"), "werktuigbouw");
eq("cnc", detectCategory("CNC Verspaner"), "werktuigbouw");
eq("werktuigbouwkundige", detectCategory("Werktuigbouwkundige"), "werktuigbouw");
eq("elektromonteur", detectCategory("Elektromonteur"), "elektrotechniek");
eq("elektricien", detectCategory("Elektricien"), "elektrotechniek");
eq("installateur", detectCategory("CV-monteur / Installateur"), "installatie-klimaat");
eq("koeltechniek", detectCategory("Monteur Koeltechniek"), "installatie-klimaat");
eq("onderhoudsmonteur", detectCategory("Onderhoudsmonteur"), "onderhoud-service");
eq("servicemonteur", detectCategory("Servicemonteur Buitendienst"), "onderhoud-service");
eq("mechatronicus", detectCategory("Mechatronicus"), "mechatronica-proces");
eq("plc", detectCategory("PLC Programmeur"), "mechatronica-proces");
eq("constructeur", detectCategory("Constructeur"), "engineering");
eq("werkvoorbereider", detectCategory("Werkvoorbereider"), "engineering");
eq("productie", detectCategory("Productiemedewerker Techniek"), "productie-montage");
eq("software returns null", detectCategory("Backend Software Engineer"), null);
eq("sales returns null", detectCategory("Account Executive"), null);

// ---- seniority ----
eq("leerling", detectSeniority("Leerling Servicemonteur"), "leerling");
eq("bbl is leerling", detectSeniority("BBL: Constructiewerker"), "leerling");
eq("stage is leerling", detectSeniority("Stage Elektrotechniek"), "leerling");
eq("zij-instroom is leerling", detectSeniority("Monteur zij-instroom waterbehandeling"), "leerling");
eq("junior", detectSeniority("Junior Monteur Installatietechniek"), "junior");
eq("allround", detectSeniority("Allround Monteur Utiliteit"), "allround");
eq("senior", detectSeniority("Senior Werkvoorbereider"), "senior");
eq("eerste monteur is senior", detectSeniority("Eerste Monteur"), "senior");
eq("voorman", detectSeniority("Voorman Elektrotechniek"), "voorman");
eq("uitvoerder is leidinggevend", detectSeniority("Uitvoerder Installatietechniek"), "leidinggevend");
eq("service manager is leidinggevend", detectSeniority("Service Manager"), "leidinggevend");
eq("no seniority", detectSeniority("Cv-monteur"), null);
eq("werkvoorbereider is not voorman", detectSeniority("Werkvoorbereider"), null);
eq("senior voorman is voorman", detectSeniority("Senior Voorman"), "voorman");

// ---- relevance gate ----
check("software engineer excluded", classify(job("Senior Backend Software Engineer")).gtmRelevant === false);
check("recruiter excluded", classify(job("Technical Recruiter")).gtmRelevant === false);
check("sales manager excluded", classify(job("Sales Manager")).gtmRelevant === false);
check("lasser is relevant", classify(job("Ervaren Lasser")).category === "werktuigbouw");
check("field engineer kept via signal", classify(job("Field Engineer")).gtmRelevant === true);

// ---- work mode ----
eq("onsite from city", detectWorkMode("Amsterdam", ""), "onsite");
eq("remote", detectWorkMode("Remote (Netherlands)", ""), "remote");
eq("hybrid", detectWorkMode("Hybrid - Utrecht", ""), "hybrid");

// ---- location ----
const ams = detectLocation("Amsterdam, Netherlands", "");
eq("ams city", ams.city, "Amsterdam");
eq("ams province", ams.province, "Noord-Holland");
eq("ams country", ams.country, "NL");
check("ams nlRelevant", ams.nlRelevant === true);
const us = detectLocation("Remote, United States", "");
check("US not nlRelevant", us.nlRelevant === false);
check("EU remote nlRelevant", detectLocation("Remote - Europe", "").nlRelevant === true);

// ---- remote eligibility from the Netherlands ----
check("plain remote kept", detectLocation("Remote", "").nlRelevant === true);
check("EMEA remote kept", detectLocation("Remote (EMEA)", "").nlRelevant === true);
check("Remote - US loc blocked", detectLocation("Remote - US", "").nlRelevant === false);
check(
  "US work-auth in desc blocked",
  detectLocation("Remote", "You must be authorized to work in the United States.").nlRelevant === false,
);
check(
  "US-based abbr in desc blocked",
  detectLocation("Remote", "This is a US-based role.").nlRelevant === false,
);
check(
  "Canada-only blocked",
  detectLocation("Remote", "Open to candidates based in Canada only.").nlRelevant === false,
);
check(
  "Europe+US kept (EU wins)",
  detectLocation("Remote", "Open to candidates in Europe and the United States.").nlRelevant === true,
);
check(
  "join-us pronoun not blocked",
  detectLocation("Remote", "About us. Join us! Contact us. We must be based here.").nlRelevant === true,
);
check(
  "non-EU territory in title blocked",
  classify(job("Strategic Account Executive - South Africa", { locationRaw: "Remote" })).location
    .nlRelevant === false,
);
check(
  "EU territory in title kept",
  classify(job("Account Executive - Benelux", { locationRaw: "Remote" })).location.nlRelevant === true,
);

// ---- Dutch-speaking Belgium (Flanders) ----
const gent = detectLocation("Gent, Belgium", "");
eq("gent city", gent.city, "Gent");
eq("gent province", gent.province, "Oost-Vlaanderen");
eq("gent country", gent.country, "BE");
check("gent nlRelevant", gent.nlRelevant === true);
check("Antwerpen kept", detectLocation("Antwerpen", "").nlRelevant === true);
check("Brussels kept", detectLocation("Brussels", "").nlRelevant === true);
check("Leuven province", detectLocation("Leuven", "").province === "Vlaams-Brabant");
check("Remote Belgium kept", detectLocation("Remote, Belgium", "").nlRelevant === true);
check("Vlaanderen remote kept", detectLocation("Remote - Vlaanderen", "").nlRelevant === true);

// ---- salary ----
const s1 = parseSalary("Salaris € 4.000 - € 5.500 per maand");
eq("month min", s1.min, 4000);
eq("month max", s1.max, 5500);
eq("month interval", s1.interval, "month");
check("month disclosed", s1.disclosed === true);
const s2 = parseSalary("Salary range: €60.000 - €80.000 per year");
eq("year min", s2.min, 60000);
eq("year max", s2.max, 80000);
const s3 = parseSalary("$120k – $160k OTE");
eq("usd currency", s3.currency, "USD");
eq("usd min", s3.min, 120000);
eq("usd max", s3.max, 160000);
check("no salary undisclosed", parseSalary("Competitive salary").disclosed === false);
const s4 = parseSalary("Sales Development | 42k basis + 15k bonus");
eq("base+bonus min is base", s4.min, 42000);
eq("base+bonus max is OTE", s4.max, 57000);
check("lone bonus undisclosed", parseSalary("Inclusief 15k bonus").disclosed === false);
const s7 = parseSalary("US Remote Range $108,000 - $145,000 USD. 401k plan with matching. Team of 2,500 specialists.");
eq("range min skips 401k/headcount", s7.min, 108000);
eq("range max skips 401k/headcount", s7.max, 145000);
check("company count is not salary", parseSalary("More than 500,000 companies use our product.").disclosed === false);
check("user/device counts are not salary", parseSalary("Supporting 30,000 users and 100,000 devices globally.").disclosed === false);
check("quota figure is not salary", parseSalary("You will own a €120k quota.").disclosed === false);
check("deal value is not salary", parseSalary("Average deal value of €150K, closing deals of €100K+.").disclosed === false);
check("deal size is not salary", parseSalary("You handle an average deal size of $100k.").disclosed === false);

// ---- AI ----
check("ai in title", detectAI("AI Engineer", "") === true);
check(
  "company AI boilerplate does not flag a non-AI title",
  detectAI("Onderhoudsmonteur", "We are an AI-powered company that uses generative AI and LLMs daily") ===
    false,
);
check("ml in title flags", detectAI("Machine Learning Engineer", "") === true);
check("no ai on single incidental mention", detectAI("Onderhoudsmonteur", "we sometimes use AI tools") === false);

// ---- text language ----
eq(
  "lang: dutch posting",
  detectTextLanguage("Wij zoeken een ervaren onderhoudsmonteur voor ons team. Je werkt met onze machines."),
  "nl",
);
eq(
  "lang: english posting",
  detectTextLanguage(
    "We are looking for an experienced maintenance technician to join our team. You will work with our machines in a full-time role.",
  ),
  "en",
);
eq("lang: empty defaults to nl", detectTextLanguage(""), "nl");
eq("lang: tie defaults to nl", detectTextLanguage("de the"), "nl");
eq(
  "lang: english word inside dutch (no false split) stays nl",
  detectTextLanguage("Een functie met veel verantwoordelijkheid en ervaring in onderhoud."),
  "nl",
);
// classify(): no description -> Dutch, even with an English-looking title
eq(
  "classify lang: no description defaults to nl",
  classify(job("Senior Maintenance Engineer for the Benelux team")).lang,
  "nl",
);
eq(
  "classify lang: english description -> en",
  classify(
    job("Maintenance Engineer", {
      descriptionText:
        "We are looking for an experienced technician to join our team. You will work with our machines in a full-time role.",
    }),
  ).lang,
  "en",
);
eq(
  "classify lang: dutch description -> nl",
  classify(
    job("Monteur", {
      descriptionText: "Wij zoeken een ervaren monteur voor ons team. Je werkt met onze machines.",
    }),
  ).lang,
  "nl",
);

// ---- summary ----
console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  console.log("\nFailures:\n - " + fails.join("\n - "));
  process.exit(1);
}
