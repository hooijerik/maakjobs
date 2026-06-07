// Minimal admin auth: a single shared token in ADMIN_TOKEN, stored in an httpOnly cookie.
// No user accounts — this protects the solo-operator admin (/admin + /api/admin/*).
import { cookies } from "next/headers";
import crypto from "node:crypto";

export const ADMIN_COOKIE = "mj_admin";

/** The configured admin token, or null when the admin is disabled (no/short token). */
export function adminToken(): string | null {
  const t = process.env.ADMIN_TOKEN;
  return t && t.length >= 8 ? t : null;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Validate a submitted token against ADMIN_TOKEN (constant-time). */
export function verifyToken(token: string): boolean {
  const t = adminToken();
  return !!t && safeEqual(token, t);
}

/** True when the current request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const t = adminToken();
  if (!t) return false;
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!c && safeEqual(c, t);
}
