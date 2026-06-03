// Shared helper: extract schema.org JobPosting entries from a page's JSON-LD.
// Most Dutch job boards embed JobPosting structured data for SEO - this is the
// cleanest, most stable thing to parse (vs. brittle DOM scraping).
import crypto from "node:crypto";
import type { AggregatorType, RawJob } from "../../../lib/types";

export const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml",
};

function idFor(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
}

function localityOf(node: any): string | undefined {
  const jl = node.jobLocation;
  const one = Array.isArray(jl) ? jl[0] : jl;
  const loc = one?.address?.addressLocality || one?.address?.addressRegion;
  const country = one?.address?.addressCountry?.name || one?.address?.addressCountry;
  const remote =
    node.jobLocationType === "TELECOMMUTE"
      ? node.applicantLocationRequirements?.name || "Remote"
      : undefined;
  return [loc, typeof country === "string" ? country : undefined].filter(Boolean).join(", ") || remote;
}

function collect(node: any, out: RawJob[], source: AggregatorType): void {
  if (!node || typeof node !== "object") return;
  const type = node["@type"];
  const isJob = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
  if (isJob && node.title) {
    const org = node.hiringOrganization?.name || node.hiringOrganization || "Onbekend";
    const url = node.url || (typeof node.sameAs === "string" ? node.sameAs : undefined) || "#";
    out.push({
      source,
      sourceId: idFor(String(url) + "|" + node.title + "|" + org),
      companyName: typeof org === "string" ? org : "Onbekend",
      title: String(node.title).trim(),
      url: String(url),
      descriptionHtml: typeof node.description === "string" ? node.description : undefined,
      locationRaw: localityOf(node),
      employmentType: Array.isArray(node.employmentType)
        ? node.employmentType[0]
        : node.employmentType,
      postedAt: node.datePosted,
    });
  }
  if (Array.isArray(node.itemListElement)) {
    for (const it of node.itemListElement) collect(it.item ?? it, out, source);
  }
}

export function parseJsonLdJobs(html: string, source: AggregatorType): RawJob[] {
  const out: RawJob[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let json: unknown;
    try {
      json = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const arr = Array.isArray(json) ? json : [json];
    for (const node of arr) collect(node, out, source);
  }
  return out;
}
