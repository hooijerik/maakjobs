"use client";
import { useState } from "react";
import { formatEURShort } from "@/lib/format";
import type { RangeStat } from "@/lib/report";
import type { Dict } from "@/lib/i18n/types";

export function SalaryEstimator({
  categories,
  seniorities,
  t,
}: {
  categories: RangeStat[];
  seniorities: RangeStat[];
  t: Dict["estimator"];
}) {
  const [cat, setCat] = useState(categories[0]?.key ?? "");
  const [sen, setSen] = useState(seniorities[Math.min(1, seniorities.length - 1)]?.key ?? "");

  const c = categories.find((x) => x.key === cat);
  const s = seniorities.find((x) => x.key === sen);
  let est: { min: number; max: number } | null = null;
  if (c && s) est = { min: Math.round((c.min + s.min) / 2), max: Math.round((c.max + s.max) / 2) };
  else if (c) est = { min: c.min, max: c.max };

  const selectCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{t.help}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.role}</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
            {categories.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">{t.level}</label>
          <select value={sen} onChange={(e) => setSen(e.target.value)} className={selectCls}>
            {seniorities.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-brand-50 p-4 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-brand-700">{t.estimated}</div>
        <div className="mt-1 text-2xl font-bold text-brand-800">
          {est ? `${formatEURShort(est.min)} – ${formatEURShort(est.max)}` : "-"}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">{t.disclaimer}</p>
    </div>
  );
}
