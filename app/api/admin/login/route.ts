import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken, verifyToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminToken()) {
    return Response.json({ ok: false, error: "Admin niet geconfigureerd (ADMIN_TOKEN ontbreekt)" }, { status: 503 });
  }
  try {
    const { token } = await req.json();
    if (!verifyToken(String(token ?? ""))) {
      return Response.json({ ok: false, error: "Onjuist wachtwoord" }, { status: 401 });
    }
    (await cookies()).set(ADMIN_COOKIE, String(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Ongeldige aanvraag" }, { status: 400 });
  }
}
