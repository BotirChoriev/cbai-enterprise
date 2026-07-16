"use client";

import type {
  ExportFutureItem,
  ReportPersona,
  ReportTrustPillar,
} from "@/lib/reports-center";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";

type ReportExportFutureProps = {
  items: readonly ExportFutureItem[];
};

export function ReportExportFuture({ items }: ReportExportFutureProps) {
  const { language } = useTranslation();
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
        <p className="mt-1 text-sm text-zinc-500">{copy.exportFutureDescription}</p>
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
        <CardHeader title={copy.noFakeAnalyticsNotice} description={copy.constitutionalCompliance} />
        <CardContent>
          <p className="text-sm text-zinc-400">{copy.noFakeAnalyticsBody}</p>
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
        <p className="mt-1 text-sm text-zinc-500">{copy.personasSectionDescription}</p>
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
        <p className="mt-1 text-sm text-zinc-500">{copy.trustSectionDescription}</p>
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
