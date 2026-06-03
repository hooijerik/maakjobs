import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, ariaLabel = "Kruimelpad" }: { items: Crumb[]; ariaLabel?: string }) {
  return (
    <nav aria-label={ariaLabel} className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="text-slate-300">/</span>}
            <li>
              {c.href ? (
                <Link href={c.href} className="hover:text-brand-700">
                  {c.label}
                </Link>
              ) : (
                <span className="text-slate-700">{c.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
