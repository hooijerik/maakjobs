// Locale routing (Next 16 `proxy` convention). Dutch lives at the ROOT (no prefix);
// English lives under /en. Internally everything maps to the app/[locale] tree.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // English: served from the /en prefix as-is (params.locale = "en").
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return NextResponse.next();
  }

  // The Dutch site is canonical at the root, so an explicit /nl/* redirects to the bare path.
  if (pathname === "/nl" || pathname.startsWith("/nl/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/nl(?=\/|$)/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  // Everything else is Dutch at the root -> rewrite to the internal /nl segment (URL stays bare).
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/nl" : `/nl${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API, Next internals, metadata/feed routes, and any file with an extension.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt|feed.xml|.*\\..*).*)",
  ],
};
