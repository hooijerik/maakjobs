// Lightweight test runner (no framework). Run with: npm test
import {
  haversineKm,
  citySlugsWithin,
  coordsWithin,
  isKnownPlace,
  ORIGIN_CITIES,
  pc4,
  postcodeCoords,
  postcodeCitySlugsWithin,
} from "../lib/geo";

let pass = 0;
const fails: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) pass++;
  else fails.push(name);
}

// ---- haversine sanity ----
const adamRdam = haversineKm(52.3676, 4.9041, 51.9244, 4.4777); // ~57 km
check(`Amsterdam-Rotterdam ~57km (got ${adamRdam.toFixed(1)})`, adamRdam > 50 && adamRdam < 65);
const adamGron = haversineKm(52.3676, 4.9041, 53.2194, 6.5665); // ~147 km
check(`Amsterdam-Groningen ~147km (got ${adamGron.toFixed(1)})`, adamGron > 135 && adamGron < 160);
check("same point = 0km", haversineKm(52, 5, 52, 5) === 0);

// ---- radius expansion ----
const near25 = citySlugsWithin("amsterdam", 25) ?? [];
check("within 25km of Amsterdam includes itself", near25.includes("amsterdam"));
check("within 25km of Amsterdam includes Haarlem", near25.includes("haarlem"));
check("within 25km of Amsterdam includes Amstelveen", near25.includes("amstelveen"));
check("within 25km of Amsterdam includes Zaandam", near25.includes("zaandam"));
check("within 25km of Amsterdam excludes Utrecht", !near25.includes("utrecht"));
check("within 25km of Amsterdam excludes Rotterdam", !near25.includes("rotterdam"));
check("within 25km of Amsterdam excludes Groningen", !near25.includes("groningen"));

// a wider radius strictly grows the set
const near75 = citySlugsWithin("amsterdam", 75) ?? [];
check("75km set is a superset of 25km set", near25.every((s) => near75.includes(s)));
check("within 75km of Amsterdam includes Utrecht", near75.includes("utrecht"));

// ---- exact place (radius 0) ----
const exact = citySlugsWithin("eindhoven", 0);
check("radius 0 returns just the origin", JSON.stringify(exact) === JSON.stringify(["eindhoven"]));

// ---- unknown origin -> null (caller falls back to exact match) ----
check("unknown origin returns null", citySlugsWithin("kleindorp-zonder-coords", 25) === null);

// ---- aliases resolve ----
check("Den Bosch alias is a known place", isKnownPlace("den-bosch"));
const denBosch = citySlugsWithin("den-bosch", 20) ?? [];
check("radius around alias resolves to canonical slug", denBosch.includes("s-hertogenbosch"));

// ---- origin list is well-formed ----
check("ORIGIN_CITIES is non-empty", ORIGIN_CITIES.length > 40);
check(
  "ORIGIN_CITIES is sorted alphabetically",
  ORIGIN_CITIES.every(
    (c, i) => i === 0 || ORIGIN_CITIES[i - 1].label.localeCompare(c.label, "nl") <= 0,
  ),
);
check(
  "every origin slug is geocoded",
  ORIGIN_CITIES.every((c) => citySlugsWithin(c.slug, 0) !== null),
);

// ---- postcode (PC4) resolution ----
check("pc4 extracts from '5611 AB'", pc4("5611 AB") === "5611");
check("pc4 extracts from '1011AB'", pc4("1011AB") === "1011");
check("pc4 rejects junk", pc4("abc") === null);
check(
  "postcodeCoords resolves Eindhoven 5611",
  (() => {
    const c = postcodeCoords("5611");
    return !!c && c[0] > 51.3 && c[0] < 51.6 && c[1] > 5.3 && c[1] < 5.6;
  })(),
);
check("postcodeCoords unknown -> null", postcodeCoords("0000") === null);

// whole chain: a city-centre postcode resolves to its own city
const pcExact = (pc: string) => JSON.stringify(postcodeCitySlugsWithin(pc, 0));
check("1011 -> Amsterdam", pcExact("1011") === JSON.stringify(["amsterdam"]));
check("9711 -> Groningen", pcExact("9711") === JSON.stringify(["groningen"]));
check("5611 -> Eindhoven", pcExact("5611") === JSON.stringify(["eindhoven"]));
check("3011 -> Rotterdam", pcExact("3011") === JSON.stringify(["rotterdam"]));

const pcNear = postcodeCitySlugsWithin("1011", 25) ?? [];
check("25km around 1011 includes Amsterdam + Haarlem", pcNear.includes("amsterdam") && pcNear.includes("haarlem"));
check("25km around 1011 excludes Groningen", !pcNear.includes("groningen"));
check("unresolvable postcode -> null", postcodeCitySlugsWithin("0000", 25) === null);
check(
  "coordsWithin point radius -> nearest city",
  JSON.stringify(coordsWithin(52.37, 4.9, 0)) === JSON.stringify(["amsterdam"]),
);

// ---- summary ----
console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  console.log("\nFailures:\n - " + fails.join("\n - "));
  process.exit(1);
}
