import { unsubscribeByToken } from "@/lib/mutations";

// Token-authenticated unsubscribe. Used both by the management page button and by the
// e-mail List-Unsubscribe (RFC 8058 one-click) header. Token is read from the query.
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (!token) return Response.json({ ok: false, error: "Geen token" }, { status: 400 });
  const ok = unsubscribeByToken(token);
  return Response.json({ ok });
}
