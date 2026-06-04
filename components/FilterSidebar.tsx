import Link from "next/link";
import { buildVacaturesUrl, PARAMS, withLocale } from "@/lib/urls";
import { categoryLabel, seniorityLabel, workModeLabel } from "@/lib/taxonomy";
import type { Facets } from "@/lib/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";

export type ActiveParams = Partial<Record<keyof typeof PARAMS, string>>;

const SALARY_PRESETS: [string, string][] = [
  ["50000", "€ 50k+"],
  ["70000", "€ 70k+"],
  ["90000", "€ 90k+"],
  ["120000", "€ 120k+"],
];
const WORKMODE_KEYS = ["onsite", "hybrid"] as const;
const DATE_KEYS = ["1", "3", "7", "14", "30"] as const;

function toggleUrl(active: ActiveParams, dim: keyof typeof PARAMS, value: string): string {
  const next: ActiveParams = { ...active };
  if (active[dim] === value) delete next[dim];
  else next[dim] = value;
  delete next.page;
  return buildVacaturesUrl(next);
}

export function FilterSidebar({
  facets,
  active,
  locale,
  dict,
}: {
  facets: Facets;
  active: ActiveParams;
  locale: Locale;
  dict: Dict;
}) {
  const f = dict.filters;
  const dateLabel: Record<string, string> = {
    "1": f.dates.d1,
    "3": f.dates.d3,
    "7": f.dates.d7,
    "14": f.dates.d14,
    "30": f.dates.d30,
  };

  const Opt = ({
    dim,
    value,
    label,
    count,
  }: {
    dim: keyof typeof PARAMS;
    value: string;
    label: string;
    count?: number;
  }) => {
    const selected = active[dim] === value;
    return (
      <li>
        <Link
          href={withLocale(locale, toggleUrl(active, dim, value))}
          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
            selected ? "bg-brand-600 font-medium text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span>{label}</span>
          {count != null && (
            <span className={selected ? "text-brand-100" : "text-slate-400"}>{count}</span>
          )}
        </Link>
      </li>
    );
  };

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <ul className="space-y-0.5 text-sm">{children}</ul>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900">{f.title}</span>
        <Link href={withLocale(locale, "/vacatures")} className="text-xs font-medium text-brand-700 hover:underline">
          {f.clear}
        </Link>
      </div>

      <Group title={f.category}>
        {facets.categories.map((x) => (
          <Opt key={x.key} dim="category" value={x.key} label={categoryLabel(x.key, locale)} count={x.count} />
        ))}
      </Group>

      <Group title={f.level}>
        {facets.seniority.map((x) => (
          <Opt key={x.key} dim="seniority" value={x.key} label={seniorityLabel(x.key, locale)} count={x.count} />
        ))}
      </Group>

      <Group title={f.workMode}>
        {WORKMODE_KEYS.map((v) => (
          <Opt
            key={v}
            dim="workMode"
            value={v}
            label={workModeLabel(v, locale)}
            count={facets.workMode.find((x) => x.key === v)?.count}
          />
        ))}
      </Group>

      <Group title={f.posted}>
        {DATE_KEYS.map((v) => (
          <Opt key={v} dim="datePosted" value={v} label={dateLabel[v]} />
        ))}
      </Group>

      <Group title={f.salaryMin}>
        {SALARY_PRESETS.map(([v, l]) => (
          <Opt key={v} dim="salary" value={v} label={l} />
        ))}
      </Group>

      {facets.cities.length > 0 && (
        <Group title={f.location}>
          {facets.cities.slice(0, 10).map((x) => (
            <Opt key={x.key} dim="city" value={x.key} label={x.label || x.key} count={x.count} />
          ))}
        </Group>
      )}


      <Group title={f.other}>
        <Opt dim="ai" value="1" label={f.aiRoles} />
      </Group>
    </div>
  );
}
