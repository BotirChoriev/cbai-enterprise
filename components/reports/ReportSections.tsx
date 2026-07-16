"use client";

import type {
  ExportFutureItem,
  ReportPersona,
  ReportTrustPillar,
} from "@/lib/reports-center";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/use-translation";
import { translatedReportStatusClass } from "@/lib/i18n/reports-center-translation";
import { getDictionary } from "@/lib/i18n/translate";

type ReportExportFutureProps = {
  items: readonly ExportFutureItem[];
};

export function ReportExportFuture({ items }: ReportExportFutureProps) {
  const { t, language } = useTranslation();
  const copy = getDictionary(language).reportsModel;

  return (
    <section className="space-y-4" aria-labelledby="report-export-heading">
      <div>
        <h2
          id="report-export-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {copy.exportFutureHeading}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Planned export formats — not available until report readiness criteria are satisfied.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader title={item.format} description={copy.statuses.planned} />
            <CardContent>
              <p className="text-sm text-zinc-400">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ReportNoFakeNotice() {
  const { language } = useTranslation();
  const copy = getDictionary(language).reportsModel;

  return (
    <section className="space-y-4" aria-labelledby="report-no-fake-heading">
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader title={copy.noFakeAnalyticsNotice} description="Constitutional compliance" />
        <CardContent>
          <p className="text-sm text-zinc-400">
            Reports Center does not generate charts, KPIs, usage statistics, or growth metrics.
            No report is produced unless connected evidence and documented methodology exist.
            When data is missing, labels read Evidence Source Not Connected or Insufficient
            Evidence.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

type ReportPersonasSectionProps = {
  personas: readonly ReportPersona[];
};

export function ReportPersonasSection({ personas }: ReportPersonasSectionProps) {
  const { language } = useTranslation();
  const copy = getDictionary(language).reportsModel;

  return (
    <section className="space-y-4" aria-labelledby="report-personas-heading">
      <div>
        <h2
          id="report-personas-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {copy.personasHeading}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Which report types each audience will find useful when evidence connects.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader title={persona.title} />
            <CardContent>
              <ul className="space-y-1 text-sm text-zinc-400">
                {persona.usefulReports.map((report) => (
                  <li key={report}>{report}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

type ReportTrustSectionProps = {
  pillars: readonly ReportTrustPillar[];
};

export function ReportTrustSection({ pillars }: ReportTrustSectionProps) {
  const { language } = useTranslation();
  const copy = getDictionary(language).reportsModel;

  return (
    <section className="space-y-4" aria-labelledby="report-trust-heading">
      <div>
        <h2
          id="report-trust-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          {copy.trustHeading}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Principles governing future report generation on CBAI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.id}>
            <CardHeader title={pillar.title} />
            <CardContent>
              <p className="text-sm text-zinc-400">{pillar.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
