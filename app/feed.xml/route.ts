import { listJobs } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { categoryLabel } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const jobs = listJobs({}, { sort: "newest", perPage: 50 });
  const items = jobs
    .map((j) => {
      const link = `${SITE.url}/vacature/${j.slug}`;
      const date = new Date(j.posted_at || j.first_seen_at);
      const pub = Number.isNaN(date.getTime()) ? new Date() : date;
      return `<item><title>${esc(`${j.title} - ${j.company_name}`)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><category>${esc(categoryLabel(j.category))}</category><pubDate>${pub.toUTCString()}</pubDate><description>${esc(`${j.title} bij ${j.company_name}${j.city ? ` in ${j.city}` : ""}.`)}</description></item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${esc(SITE.name)} - Nieuwste technische vacatures</title><link>${SITE.url}</link><description>${esc(SITE.description)}</description><language>nl-nl</language>${items}</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
