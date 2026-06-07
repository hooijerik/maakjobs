import "../globals.css";
import type { Metadata } from "next";

// Own root layout (no public SiteHeader/footer/analytics). /admin is excluded from the
// locale rewrite in proxy.ts, so it is served bare at /admin.
export const metadata: Metadata = {
  title: "Admin · Maakjobs",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-dvh bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
