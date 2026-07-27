"use client";

import type { CountryTimelineModel } from "@/lib/timeline";
import { timelineReadinessStatusClass } from "@/lib/timeline";
import { useTranslation } from "@/lib/i18n/use-translation";

type TimelineReadinessPanelProps = {
  model: CountryTimelineModel;
};

function readinessKey(status: CountryTimelineModel["readinessStatus"]): string {
  if (status === "planned") return "timelineUi.readinessPlanned";
  if (status === "partial") return "timelineUi.readinessPartial";
  if (status === "ready_for_evidence") return "timelineUi.readinessReadyForEvidence";
  return "timelineUi.readinessVerified";
}

export default function TimelineReadinessPanel({ model }: TimelineReadinessPanelProps) {
  const { t } = useTranslation();

  const emptyStateCopy = model.evidenceNotConnected
    ? model.supportedYears.length > 0
      ? t("timelineUi.yearStructurePrepared")
      : t("timelineUi.evidenceNotConnectedEmpty")
    : t("timelineUi.yearSlotsConnected", {
        connected: String(model.availableEvidenceYears.length),
        total: String(model.supportedYears.length),
      });

  return (
    <section className="space-y-4" aria-labelledby="country-timeline-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="country-timeline-heading"
            className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
          >
            {t("timelineUi.readinessHeading")}
          </h3>
          <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">
            {t("timelineUi.readinessDescription", { entity: model.entityLabel })}
          </p>
        </div>
        <span
          className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${timelineReadinessStatusClass(model.readinessStatus)}`}
        >
          {t(readinessKey(model.readinessStatus))}
        </span>
      </div>

      {model.evidenceNotConnected ? (
        <div className="rounded-xl border border-dashed border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-6 text-center">
          <p className="font-mono text-sm text-[var(--cbai-text-secondary)]">{emptyStateCopy}</p>
          <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">{t("timelineUi.emptyPlaceholderNote")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-sm text-[var(--cbai-text-secondary)]">{emptyStateCopy}</p>
        </div>
      )}

      <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {t("timelineUi.verifiedYears")}
            </dt>
            <dd className="mt-1 font-mono text-[var(--cbai-text-primary)]">
              {model.availableEvidenceYears.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {t("timelineUi.missingYears")}
            </dt>
            <dd className="mt-1 font-mono text-[var(--cbai-text-primary)]">{model.missingEvidenceYears.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-[var(--cbai-text-muted)]">
              {t("timelineUi.structuralSlots")}
            </dt>
            <dd className="mt-1 font-mono text-[var(--cbai-text-primary)]">{model.supportedYears.length}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
