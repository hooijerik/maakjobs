"use client";
import { useState } from "react";
import type { Dict } from "@/lib/i18n/types";

export function AlertForm({
  t,
  categories,
}: {
  t: Dict["forms"]["alert"];
  categories: { slug: string; label: string }[];
}) {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const r = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, category: category || undefined, frequency }),
      });
      const d = await r.json();
      setStatus(d.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-2xl">✅</div>
        <h3 className="mt-2 font-bold text-emerald-900">{t.success}</h3>
        <p className="mt-1 text-sm text-emerald-700">{t.successBody}</p>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder}
        className={input}
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          <option value="">{t.allCategories}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={input}>
          <option value="daily">{t.daily}</option>
          <option value="weekly">{t.weekly}</option>
        </select>
      </div>
      {status === "error" && <p className="text-sm text-red-600">{t.error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "loading" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
