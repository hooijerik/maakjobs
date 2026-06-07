"use client";
import { useState } from "react";
import type { Dict } from "@/lib/i18n/types";

// Coarse salary floors — matches the website filter (only ~14% of jobs disclose pay).
const SALARY_OPTIONS: [string, string][] = [
  ["40000", "€ 40k+"],
  ["50000", "€ 50k+"],
  ["60000", "€ 60k+"],
  ["75000", "€ 75k+"],
];
const RADII = [5, 10, 25, 50, 75, 100] as const;

export function AlertForm({
  t,
  categories,
  seniorities,
}: {
  t: Dict["forms"]["alert"];
  categories: { slug: string; label: string }[];
  seniorities: { slug: string; label: string }[];
}) {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [seniority, setSeniority] = useState("");
  const [postcode, setPostcode] = useState("");
  const [radius, setRadius] = useState("25");
  const [salary, setSalary] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const r = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category: category || undefined,
          seniority: seniority || undefined,
          postcode: postcode.trim() || undefined,
          radiusKm: postcode.trim() ? Number(radius) : undefined,
          salaryMin: salary ? Number(salary) : undefined,
          frequency,
        }),
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

  const field =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
  const labelCls = "mb-1 block text-xs font-medium text-slate-500";

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder}
        className={field}
      />

      <p className="pt-1 text-xs text-slate-400">{t.filtersHint}</p>

      <div>
        <label className={labelCls}>{t.fieldCategory}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          <option value="">{t.allCategories}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.fieldLocation}</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder={t.postcodePlaceholder}
            pattern="\s*[1-9][0-9]{3}\s?[A-Za-z]{0,2}\s*"
            title={t.postcodeHint}
            maxLength={8}
            className={field}
          />
        </div>
        <div>
          <label className={labelCls}>{t.fieldDistance}</label>
          <select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            disabled={!postcode.trim()}
            className={`${field} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
          >
            {RADII.map((km) => (
              <option key={km} value={km}>
                +{km} km
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.fieldLevel}</label>
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)} className={field}>
            <option value="">{t.allLevels}</option>
            {seniorities.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.fieldSalary}</label>
          <select value={salary} onChange={(e) => setSalary(e.target.value)} className={field}>
            <option value="">{t.anySalary}</option>
            {SALARY_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.fieldFrequency}</label>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={field}>
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
