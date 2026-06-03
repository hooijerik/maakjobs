import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

type ChipProps = {
  children: ReactNode;
  href?: string;
  tone?: "default" | "brand" | "green" | "amber" | "slate";
  className?: string;
};
const chipTones: Record<string, string> = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-800 text-white ring-slate-700",
};
export function Chip({ children, href, tone = "default", className = "" }: ChipProps) {
  const cls = `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${chipTones[tone]} ${href ? "transition hover:brightness-95" : ""} ${className}`;
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold tracking-tight sm:text-4xl">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

export function SectionHeading({
  title,
  href,
  linkLabel = "Bekijk alles",
  subtitle,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</div>
  );
}
