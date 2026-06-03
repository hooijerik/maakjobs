import { addSubscriber } from "@/lib/mutations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filters = body.category ? { category: String(body.category) } : undefined;
    const res = await addSubscriber(String(body.email ?? ""), filters, String(body.frequency ?? "daily"));
    return Response.json(res, { status: res.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, error: "Ongeldige aanvraag" }, { status: 400 });
  }
}
