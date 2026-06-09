import { updateSubscriberFrequency } from "@/lib/mutations";

// Token-authenticated alert preferences update.
export async function POST(req: Request) {
  try {
    const { token, frequency } = await req.json();
    if (!token) return Response.json({ ok: false, error: "Geen token" }, { status: 400 });
    const ok = updateSubscriberFrequency(String(token), String(frequency ?? "daily"));
    return Response.json({ ok });
  } catch {
    return Response.json({ ok: false, error: "Ongeldige aanvraag" }, { status: 400 });
  }
}
