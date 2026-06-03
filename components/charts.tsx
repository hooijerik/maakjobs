import { formatEURShort } from "@/lib/format";
import type { RangeStat, Slice } from "@/lib/report";

const PALETTE = ["#7c3aed", "#a78bfa", "#10b981", "#f59e0b", "#64748b", "#0ea5e9", "#ec4899"];

/** Horizontal range ("dumbbell") chart: each row shows a min–max salary band. */
export function RangeChart({ data, scaleMax }: { data: RangeStat[]; scaleMax: number }) {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Nog te weinig data voor deze uitsplitsing.</p>;
  }
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const left = (d.min / scaleMax) * 100;
        const width = Math.max(((d.max - d.min) / scaleMax) * 100, 1.5);
        return (
          <div
            key={d.key}
            className="grid grid-cols-[110px_1fr_84px] items-center gap-3 sm:grid-cols-[160px_1fr_110px]"
          >
            <div className="truncate text-sm text-slate-700">
              {d.label} <span className="text-slate-400">({d.count})</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-slate-100">
              <div
                className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            </div>
            <div className="text-right text-xs tabular-nums text-slate-600">
              {formatEURShort(d.min)}–{formatEURShort(d.max)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** SVG donut with legend. */
export function Donut({ data, centerLabel }: { data: Slice[]; centerLabel?: string }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  let acc = 0;
  if (!data.length) return <p className="text-sm text-slate-400">Geen data.</p>;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
          {data.map((s, i) => {
            const len = (c * s.pct) / 100;
            const el = (
              <circle
                key={i}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="18"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-acc}
              />
            );
            acc += len;
            return el;
          })}
        </g>
        {centerLabel && (
          <text x="70" y="75" textAnchor="middle" className="fill-slate-700 text-sm font-semibold">
            {centerLabel}
          </text>
        )}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-slate-700">{s.label}</span>
            <span className="text-slate-400">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
