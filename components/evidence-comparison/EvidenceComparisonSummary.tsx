"use client";

import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";
import { comparisonReadinessStatusClass } from "@/lib/evidence-comparison";
import { userComparisonReadinessLabel } from "@/components/shared/user-facing-copy";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceComparisonSummaryProps = {
  comparison: EvidenceComparisonRecord;
};

export default function EvidenceComparisonSummary({ comparison }: EvidenceComparisonSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--cbai-text-secondary)]">
          <span className="font-medium text-[var(--cbai-text-primary)]">{comparison.leftEntityLabel}</span>
          {" vs "}
          <span className="font-medium text-[var(--cbai-text-primary)]">{comparison.rightEntityLabel}</span>
        </p>
        <span
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${comparisonReadinessStatusClass(comparison.readinessStatus)}`}
        >
          {userComparisonReadinessLabel(comparison.readinessStatus)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-4 py-4">
          <p
            className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
            title={comparison.leftEntityLabel}
          >
            {t("evidenceComparisonUi.connectedSuffix", { entity: comparison.leftEntityLabel })}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--cbai-text-primary)]">
            {comparison.leftAvailableEvidence.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-4 py-4">
          <p
            className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
            title={comparison.rightEntityLabel}
          >
            {t("evidenceComparisonUi.connectedSuffix", { entity: comparison.rightEntityLabel })}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--cbai-text-primary)]">
            {comparison.rightAvailableEvidence.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("evidenceComparisonUi.sharedTopics")}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--cbai-text-primary)]">
            {comparison.sharedIndicators.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("evidenceComparisonUi.sharedSourceReferences")}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[var(--cbai-text-primary)]">
            {comparison.sharedSources.length}
          </p>
        </div>
      </div>
      {/*
        Honesty invariant (data-activation guard): the "Shared source references" count above is
        NOT a claim that evidence is available or verified from those sources — it only counts
        sources both profiles expect. The user-facing disclaimer is rendered (localized) below via
        `connectedFootnote`, which states this is "not a claim that evidence is available" from all of them.
      */}
      <p className="text-xs text-[var(--cbai-text-muted)]">{t("evidenceComparisonUi.connectedFootnote")}</p>
    </div>
  );
}
