import Link from "next/link";
import { buildVacaturesUrl, withLocale } from "@/lib/urls";
import type { ActiveParams } from "./FilterSidebar";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/types";

export function Pagination({
  total,
  perPage,
  page,
  active,
  sort,
  locale,
  dict,
}: {
  total: number;
  perPage: number;
  page: number;
  active: ActiveParams;
  sort?: string;
  locale: Locale;
  dict: Dict["pagination"];
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const url = (n: number) =>
    withLocale(
      locale,
      buildVacaturesUrl({
        ...active,
        sort: sort && sort !== "newest" ? sort : undefined,
        page: n > 1 ? String(n) : undefined,
      }),
    );

  const items: (number | "…")[] = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 2) items.push(n);
    else if (items[items.length - 1] !== "…") items.push("…");
  }

  const base = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm";

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label={dict.aria}>
      {page > 1 && (
        <Link href={url(page - 1)} className={`${base} border border-slate-200 bg-white hover:bg-slate-50`}>
          {dict.prev}
        </Link>
      )}
      {items.map((it, i) =>
        it === "…" ? (
          <span key={`e${i}`} className={`${base} text-slate-400`}>
            …
          </span>
        ) : (
          <Link
            key={it}
            href={url(it)}
            className={`${base} ${
              it === page
                ? "bg-brand-600 font-semibold text-white"
                : "border border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            {it}
          </Link>
        ),
      )}
      {page < pages && (
        <Link href={url(page + 1)} className={`${base} border border-slate-200 bg-white hover:bg-slate-50`}>
          {dict.next}
        </Link>
      )}
    </nav>
  );
}
