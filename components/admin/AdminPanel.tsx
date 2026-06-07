"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PremiumOrderRow } from "@/lib/types";

export type AdminOpt = { slug: string; label: string };
export type AdminSubmission = {
  id: number;
  company_name: string | null;
  contact_email: string | null;
  payload_json: string | null;
  status: string;
  created_at: string;
};
export type AdminManualJob = {
  id: number;
  slug: string;
  title: string;
  featured: number;
  featured_until: string | null;
};
export type AdminFeaturedCompany = { slug: string; name: string; featured_until: string | null };

type ActionResult = { ok: boolean; error?: string; id?: number; slug?: string };

async function callAction(payload: Record<string, unknown>): Promise<ActionResult> {
  const r = await fetch("/api/admin/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const label = "mb-1 block text-xs font-medium text-slate-500";
const btn = "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

export function AdminPanel({
  categories,
  seniorities,
  submissions,
  manualJobs,
  featuredCompanies,
  orders,
}: {
  categories: AdminOpt[];
  seniorities: AdminOpt[];
  submissions: AdminSubmission[];
  manualJobs: AdminManualJob[];
  featuredCompanies: AdminFeaturedCompany[];
  orders: PremiumOrderRow[];
}) {
  const router = useRouter();
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function show(d: ActionResult, okMsg: string) {
    setFlash(d.ok ? { ok: true, msg: okMsg } : { ok: false, msg: d.error || "Mislukt" });
  }

  async function run(payload: Record<string, unknown>, okMsg: string, form?: HTMLFormElement) {
    setBusy(true);
    setFlash(null);
    try {
      const d = await callAction(payload);
      show(d, okMsg);
      if (d.ok) {
        form?.reset();
        router.refresh();
      }
    } catch {
      setFlash({ ok: false, msg: "Netwerkfout" });
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    location.reload();
  }

  function onCreateJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    run(
      {
        action: "createJob",
        companyName: fd.get("companyName"),
        companyWebsite: fd.get("companyWebsite"),
        title: fd.get("title"),
        url: fd.get("url"),
        applyUrl: fd.get("applyUrl"),
        locationRaw: fd.get("locationRaw"),
        descriptionText: fd.get("descriptionText"),
        category: fd.get("category") || undefined,
        seniority: fd.get("seniority"),
        featured: fd.get("featured") === "on",
        featuredDays: Number(fd.get("featuredDays")) || 30,
      },
      "Vacature aangemaakt en gepubliceerd",
      form,
    );
  }

  function onFeature(action: "featureJob" | "featureCompany", e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    run(
      { action, slug: fd.get("slug"), featured: true, days: Number(fd.get("days")) || 30 },
      "Uitgelicht bijgewerkt",
      form,
    );
  }

  function onCreateOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    run(
      {
        action: "createOrder",
        kind: fd.get("kind"),
        companyName: fd.get("companyName"),
        buyerEmail: fd.get("buyerEmail"),
        package: fd.get("package"),
        amountEur: fd.get("amountEur"),
        notes: fd.get("notes"),
      },
      "Order toegevoegd",
      form,
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maakjobs admin</h1>
          <p className="text-sm text-slate-500">Premium-plaatsingen beheren</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">
          Uitloggen
        </button>
      </header>

      {flash && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            flash.ok ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
          }`}
        >
          {flash.msg}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Nieuwe premium vacature">
          <form onSubmit={onCreateJob} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Bedrijf *</label>
                <input name="companyName" required className={input} />
              </div>
              <div>
                <label className={label}>Website</label>
                <input name="companyWebsite" placeholder="https://…" className={input} />
              </div>
            </div>
            <div>
              <label className={label}>Functietitel *</label>
              <input name="title" required className={input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Vacature-URL *</label>
                <input name="url" required placeholder="https://…" className={input} />
              </div>
              <div>
                <label className={label}>Sollicitatie-URL</label>
                <input name="applyUrl" placeholder="(optioneel)" className={input} />
              </div>
            </div>
            <div>
              <label className={label}>Locatie</label>
              <input name="locationRaw" placeholder="bijv. Eindhoven, NL" className={input} />
            </div>
            <div>
              <label className={label}>Omschrijving</label>
              <textarea name="descriptionText" rows={4} className={input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Categorie (auto indien leeg)</label>
                <select name="category" className={input}>
                  <option value="">Automatisch</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Niveau (auto indien leeg)</label>
                <select name="seniority" className={input}>
                  <option value="">Automatisch</option>
                  {seniorities.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="featured" defaultChecked /> Uitgelicht
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Looptijd
                <input name="featuredDays" type="number" min={1} defaultValue={30} className="w-20 rounded-lg border border-slate-300 px-2 py-1" /> dagen
              </label>
            </div>
            <button type="submit" disabled={busy} className={btn}>
              Publiceren
            </button>
          </form>
        </Card>

        <div className="space-y-5">
          <Card title="Bestaande vacature uitlichten">
            <form onSubmit={(e) => onFeature("featureJob", e)} className="flex items-end gap-2">
              <div className="flex-1">
                <label className={label}>Vacature-slug</label>
                <input name="slug" required placeholder="senior-monteur-acme-1a2b3c4d" className={input} />
              </div>
              <div>
                <label className={label}>Dagen</label>
                <input name="days" type="number" min={1} defaultValue={30} className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
              </div>
              <button type="submit" disabled={busy} className={btn}>
                Uitlichten
              </button>
            </form>
          </Card>

          <Card title="Bedrijf uitlichten (employer branding)">
            <form onSubmit={(e) => onFeature("featureCompany", e)} className="flex items-end gap-2">
              <div className="flex-1">
                <label className={label}>Bedrijf-slug</label>
                <input name="slug" required placeholder="acme-techniek" className={input} />
              </div>
              <div>
                <label className={label}>Dagen</label>
                <input name="days" type="number" min={1} defaultValue={30} className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm" />
              </div>
              <button type="submit" disabled={busy} className={btn}>
                Uitlichten
              </button>
            </form>
            {featuredCompanies.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {featuredCompanies.map((c) => (
                  <li key={c.slug} className="flex items-center justify-between">
                    <span>{c.name}</span>
                    <button
                      onClick={() => run({ action: "featureCompany", slug: c.slug, featured: false }, "Bedrijf niet meer uitgelicht")}
                      className="text-xs text-red-600 hover:underline"
                    >
                      stoppen {c.featured_until ? `(tot ${c.featured_until.slice(0, 10)})` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Order / lead toevoegen">
            <form onSubmit={onCreateOrder} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select name="kind" className={input}>
                  <option value="job">Vacature</option>
                  <option value="company">Bedrijf</option>
                  <option value="combo">Combinatie</option>
                </select>
                <input name="package" placeholder="Pakket" className={input} />
                <input name="companyName" placeholder="Bedrijf" className={input} />
                <input name="buyerEmail" placeholder="E-mail" className={input} />
                <input name="amountEur" type="number" step="0.01" placeholder="Bedrag €" className={input} />
                <input name="notes" placeholder="Notitie" className={input} />
              </div>
              <button type="submit" disabled={busy} className={btn}>
                Toevoegen
              </button>
            </form>
          </Card>
        </div>
      </div>

      <Card title="Premium orders">
        <Table
          head={["Datum", "Soort", "Bedrijf", "Pakket", "€", "Status"]}
          rows={orders.map((o) => [
            o.created_at?.slice(0, 10),
            o.kind,
            o.company_name || o.buyer_email || "-",
            o.package || "-",
            o.amount_eur != null ? `€${o.amount_eur}` : "-",
            <select
              key="s"
              defaultValue={o.status}
              onChange={(e) => run({ action: "updateOrder", id: o.id, fields: { status: e.target.value } }, "Status bijgewerkt")}
              className="rounded border border-slate-300 px-1.5 py-1 text-xs"
            >
              {["lead", "invoiced", "paid", "active", "expired", "cancelled"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>,
          ])}
          empty="Nog geen orders."
        />
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title={`Werkgevers-inzendingen (${submissions.length})`}>
          <Table
            head={["Datum", "Bedrijf", "E-mail", "Status"]}
            rows={submissions.map((s) => [s.created_at?.slice(0, 10), s.company_name || "-", s.contact_email || "-", s.status])}
            empty="Nog geen inzendingen."
          />
        </Card>

        <Card title={`Handmatige vacatures (${manualJobs.length})`}>
          <Table
            head={["Titel", "Uitgelicht", ""]}
            rows={manualJobs.map((j) => [
              <a key="t" href={`/vacature/${j.slug}`} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">
                {j.title}
              </a>,
              j.featured ? `tot ${j.featured_until?.slice(0, 10) ?? "∞"}` : "nee",
              <button
                key="b"
                onClick={() =>
                  run(
                    { action: "featureJob", slug: j.slug, featured: !j.featured, days: 30 },
                    j.featured ? "Niet meer uitgelicht" : "Uitgelicht",
                  )
                }
                className="text-xs text-slate-600 hover:underline"
              >
                {j.featured ? "stop" : "uitlichten"}
              </button>,
            ])}
            empty="Nog geen handmatige vacatures."
          />
        </Card>
      </div>
    </main>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-slate-400">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-slate-400">
            {head.map((h, i) => (
              <th key={i} className="pb-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className="py-2 pr-3 align-top text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
