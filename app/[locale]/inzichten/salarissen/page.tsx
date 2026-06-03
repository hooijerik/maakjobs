import type { Metadata } from "next";
import { Container, Card } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RangeChart, Donut } from "@/components/charts";
import { SalaryEstimator } from "@/components/SalaryEstimator";
import { buildSalaryReport } from "@/lib/report";
import { formatEURShort } from "@/lib/format";
import { withLocale } from "@/lib/urls";
import { getDictionary, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/i18n/meta";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.salary.title,
    description: dict.home.salaryBody,
    alternates: alternates(locale, "/inzichten/salarissen"),
  };
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mb-4 mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </Card>
  );
}

export default async function SalaryReportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.salary;
  const L = (p: string) => withLocale(locale, p);
  const r = buildSalaryReport(locale);

  return (
    <Container className="py-8">
      <Breadcrumbs
        ariaLabel={dict.breadcrumbs.aria}
        items={[
          { label: dict.breadcrumbs.home, href: L("/") },
          { label: dict.nav.insights, href: L("/inzichten") },
          { label: dict.nav.salaries },
        ]}
      />

      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t.title}</h1>
        <p className="mt-2 text-lg text-slate-600">
          {t.intro(r.disclosed)} {t.updated}
        </p>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-slate-500">{t.medianRange}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {r.overall ? `${formatEURShort(r.overall.min)} – ${formatEURShort(r.overall.max)}` : "-"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">{t.disclosePct}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{r.disclosureRate}%</div>
          <div className="text-xs text-slate-400">{t.discloseOf(r.disclosed, r.totalActive)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">{t.aiPremium}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {r.aiPremium.pct != null ? `${r.aiPremium.pct > 0 ? "+" : ""}${r.aiPremium.pct}%` : "-"}
          </div>
          <div className="text-xs text-slate-400">{t.aiPremiumSub}</div>
        </Card>
      </div>

      {/* Estimator */}
      {r.byCategory.length > 0 && r.bySeniority.length > 0 && (
        <div className="mt-6">
          <SalaryEstimator categories={r.byCategory} seniorities={r.bySeniority} t={dict.estimator} />
        </div>
      )}

      {/* Breakdowns */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={t.byCategory} subtitle={t.byCategorySub}>
          <RangeChart data={r.byCategory} scaleMax={r.scaleMax} />
        </Panel>
        <Panel title={t.byLevel} subtitle={t.byLevelSub}>
          <RangeChart data={r.bySeniority} scaleMax={r.scaleMax} />
        </Panel>
        <Panel title={t.byWorkMode} subtitle={t.byWorkModeSub}>
          <RangeChart data={r.byWorkMode} scaleMax={r.scaleMax} />
        </Panel>
        <Panel title={t.byRegion} subtitle={t.byRegionSub}>
          <RangeChart data={r.byProvince} scaleMax={r.scaleMax} />
        </Panel>
      </div>

      {/* AI premium + comp + equity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title={t.aiPremium} subtitle={t.aiCompare}>
          {r.aiPremium.withAI && r.aiPremium.withoutAI ? (
            <RangeChart
              data={[
                { ...r.aiPremium.withAI, label: t.withAi },
                { ...r.aiPremium.withoutAI, label: t.withoutAi },
              ]}
              scaleMax={r.scaleMax}
            />
          ) : (
            <p className="text-sm text-slate-400">{t.tooLittleData}</p>
          )}
        </Panel>
        <Panel title={t.compStructure} subtitle={t.compStructureSub}>
          <Donut data={r.compStructure} />
        </Panel>
        <Panel title={t.equity} subtitle={t.equitySub}>
          {r.equity.length ? (
            <Donut data={r.equity} />
          ) : (
            <p className="text-sm text-slate-400">{t.tooLittleData}</p>
          )}
        </Panel>
      </div>

      {/* Methodology */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        <h2 className="font-semibold text-slate-700">{t.methodology}</h2>
        <p className="mt-2">{t.methodologyBody(r.disclosed, r.disclosureRate)}</p>
      </div>
    </Container>
  );
}
