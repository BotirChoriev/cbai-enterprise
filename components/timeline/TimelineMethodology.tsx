"use client";

import type { CountryTimelineModel } from "@/lib/timeline";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/use-translation";

type TimelineMethodologyProps = {
  model: CountryTimelineModel;
};

export default function TimelineMethodology({ model }: TimelineMethodologyProps) {
  const { t } = useTranslation();
  const references = model.methodologyReferences.slice(0, 6);

  return (
    <section className="space-y-4" aria-labelledby="timeline-methodology-heading">
      <div>
        <h4
          id="timeline-methodology-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("timelineUi.methodologyHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("timelineUi.methodologyDescription")}</p>
      </div>

      {references.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--cbai-border-default)] px-5 py-4 text-sm text-[var(--cbai-text-muted)]">
          {t("timelineUi.methodologyEmpty")}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {references.map((ref) => (
            <Card key={ref.indicatorId}>
              <CardHeader title={ref.indicatorTitle} />
              <CardContent className="space-y-2">
                <p className="text-sm text-[var(--cbai-text-secondary)]">{ref.whyItExists}</p>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
                    {t("timelineUi.requiredEvidence")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{ref.requiredEvidence}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
                    {t("timelineUi.missingEvidence")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{ref.missingEvidence}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {model.methodologyReferences.length > references.length ? (
        <p className="text-xs text-[var(--cbai-text-muted)]">
          {t("timelineUi.methodologyShowing", {
            shown: String(references.length),
            total: String(model.methodologyReferences.length),
          })}
        </p>
      ) : null}
    </section>
  );
}
