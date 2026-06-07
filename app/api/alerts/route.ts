import { addSubscriber } from "@/lib/mutations";

const RADII = new Set([5, 10, 25, 50, 75, 100]);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // All filters are optional; only include the ones the subscriber actually set.
    const filters: Record<string, string | number> = {};
    if (body.category) filters.category = String(body.category);
    if (body.seniority) filters.seniority = String(body.seniority);

    // Location is a Dutch postcode (PC4) + radius. Keep only the 4-digit prefix.
    const pc = String(body.postcode ?? "").match(/[1-9]\d{3}/);
    if (pc) {
      filters.postcode = pc[0];
      const r = Number(body.radiusKm);
      filters.radiusKm = Number.isFinite(r) && RADII.has(r) ? r : 25;
    }

    const salary = Number(body.salaryMin);
    if (Number.isFinite(salary) && salary > 0) filters.salaryMin = salary;

    const res = await addSubscriber(
      String(body.email ?? ""),
      Object.keys(filters).length ? filters : undefined,
      String(body.frequency ?? "daily"),
    );
    return Response.json(res, { status: res.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, error: "Ongeldige aanvraag" }, { status: 400 });
  }
}
