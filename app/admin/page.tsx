import { isAdmin, adminToken } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { listPremiumOrders } from "@/lib/mutations";
import { CATEGORIES, SENIORITY, categoryLabel, seniorityLabel } from "@/lib/taxonomy";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminPanel } from "@/components/admin/AdminPanel";
import type { AdminSubmission, AdminManualJob, AdminFeaturedCompany } from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminToken()) {
    return (
      <main className="mx-auto max-w-md p-8">
        <p className="rounded-lg bg-amber-100 p-4 text-sm text-amber-900">
          Admin is niet geconfigureerd. Zet een <code>ADMIN_TOKEN</code> (min. 8 tekens) in de omgeving en herstart.
        </p>
      </main>
    );
  }
  if (!(await isAdmin())) return <AdminLogin />;

  const db = getDb();
  const submissions = db
    .prepare(
      "SELECT id, company_name, contact_email, payload_json, status, created_at FROM employer_submissions ORDER BY created_at DESC LIMIT 50",
    )
    .all() as AdminSubmission[];
  const manualJobs = db
    .prepare(
      "SELECT id, slug, title, featured, featured_until FROM jobs WHERE source='manual' ORDER BY id DESC LIMIT 50",
    )
    .all() as AdminManualJob[];
  const featuredCompanies = db
    .prepare("SELECT slug, name, featured_until FROM companies WHERE featured=1 ORDER BY name COLLATE NOCASE LIMIT 50")
    .all() as AdminFeaturedCompany[];
  const orders = listPremiumOrders(50);

  const categories = CATEGORIES.map((c) => ({ slug: c.slug, label: categoryLabel(c.slug, "nl") }));
  const seniorities = [...SENIORITY]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ slug: s.slug, label: seniorityLabel(s.slug, "nl") }));

  return (
    <AdminPanel
      categories={categories}
      seniorities={seniorities}
      submissions={submissions}
      manualJobs={manualJobs}
      featuredCompanies={featuredCompanies}
      orders={orders}
    />
  );
}
