"use client";

import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceComparisonGapsProps = {
  comparison: EvidenceComparisonRecord;
};

export default function EvidenceComparisonGaps({ comparison }: EvidenceComparisonGapsProps) {
  const { t } = useTranslation();
  const leftOnlyGaps = comparison.leftEvidenceGaps.filter(
    (id) => !comparison.rightEvidenceGaps.includes(id),
  );
  const rightOnlyGaps = comparison.rightEvidenceGaps.filter(
    (id) => !comparison.leftEvidenceGaps.includes(id),
  );
  const sharedGaps = comparison.leftEvidenceGaps.filter((id) =>
    comparison.rightEvidenceGaps.includes(id),
  );

  return (
    <section className="space-y-4" aria-labelledby="comparison-gaps-heading">
      <div>
        <h4
          id="comparison-gaps-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("evidenceComparisonUi.gapsHeading")}
        </h4>
        <p className="mt-1 text-sm text-[var(--cbai-text-muted)]">{t("evidenceComparisonUi.gapsDescription")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("evidenceComparisonUi.bothProfiles", { count: String(sharedGaps.length) })}
          </p>
          <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">
            {sharedGaps.length === 0
              ? t("evidenceComparisonUi.noSharedMissing")
              : t("evidenceComparisonUi.sharedMissingCount", { count: String(sharedGaps.length) })}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("evidenceComparisonUi.profileOnly", {
              entity: comparison.leftEntityLabel,
              count: String(leftOnlyGaps.length),
            })}
          </p>
          <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">
            {leftOnlyGaps.length === 0
              ? t("evidenceComparisonUi.nothingMissingOnly")
              : t("evidenceComparisonUi.missingOnlyCount", { count: String(leftOnlyGaps.length) })}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]">
            {t("evidenceComparisonUi.profileOnly", {
              entity: comparison.rightEntityLabel,
              count: String(rightOnlyGaps.length),
            })}
          </p>
          <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">
            {rightOnlyGaps.length === 0
              ? t("evidenceComparisonUi.nothingMissingOnly")
              : t("evidenceComparisonUi.missingOnlyCount", { count: String(rightOnlyGaps.length) })}
          </p>
        </div>
      </div>
    </section>
  );
}
