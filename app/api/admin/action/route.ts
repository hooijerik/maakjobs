import { isAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import {
  createManualJob,
  setJobFeatured,
  setCompanyFeatured,
  createPremiumOrder,
  updatePremiumOrder,
} from "@/lib/mutations";

const untilSql = (featured: boolean, days: unknown) =>
  featured ? `+${Math.max(1, Math.floor(Number(days) || 30))} days` : null;

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: "Niet ingelogd" }, { status: 401 });
  try {
    const body = await req.json();
    const action = String(body.action ?? "");

    switch (action) {
      case "createJob": {
        if (!body.companyName || !body.title || !body.url) {
          return Response.json({ ok: false, error: "Bedrijf, titel en URL zijn verplicht" }, { status: 400 });
        }
        const r = createManualJob({
          companyName: String(body.companyName).trim(),
          companyWebsite: body.companyWebsite || null,
          title: String(body.title).trim(),
          url: String(body.url).trim(),
          applyUrl: body.applyUrl || null,
          descriptionText: body.descriptionText || null,
          descriptionHtml: body.descriptionHtml || null,
          locationRaw: body.locationRaw || null,
          category: body.category || undefined,
          seniority: body.seniority === "" ? null : body.seniority || undefined,
          featured: body.featured !== false,
          featuredDays: Number(body.featuredDays) || 30,
        });
        return Response.json({ ok: true, ...r });
      }

      case "featureJob": {
        const slug = String(body.slug ?? "").trim();
        const row = getDb().prepare("SELECT id FROM jobs WHERE slug=?").get(slug) as { id: number } | undefined;
        if (!row) return Response.json({ ok: false, error: "Vacature niet gevonden" }, { status: 404 });
        const featured = body.featured !== false;
        setJobFeatured(row.id, featured, untilSql(featured, body.days));
        return Response.json({ ok: true });
      }

      case "featureCompany": {
        const slug = String(body.slug ?? "").trim();
        const row = getDb().prepare("SELECT id FROM companies WHERE slug=?").get(slug) as { id: number } | undefined;
        if (!row) return Response.json({ ok: false, error: "Bedrijf niet gevonden" }, { status: 404 });
        const featured = body.featured !== false;
        setCompanyFeatured(row.id, featured, untilSql(featured, body.days));
        return Response.json({ ok: true });
      }

      case "createOrder": {
        const id = createPremiumOrder({
          kind: body.kind || "job",
          buyerEmail: body.buyerEmail || null,
          companyName: body.companyName || null,
          package: body.package || null,
          amountEur: body.amountEur !== undefined && body.amountEur !== "" ? Number(body.amountEur) : null,
          status: body.status || "lead",
          notes: body.notes || null,
        });
        return Response.json({ ok: true, id });
      }

      case "updateOrder": {
        updatePremiumOrder(Number(body.id), (body.fields || {}) as Record<string, string | number | null>);
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ ok: false, error: "Onbekende actie" }, { status: 400 });
    }
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
