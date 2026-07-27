"use client";

import type { EvidenceComparisonRecord } from "@/lib/evidence-comparison";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceComparisonLimitationsProps = {
  comparison: EvidenceComparisonRecord | null;
  limitations: readonly string[];
  unsupportedMessage: string | null;
};

export default function EvidenceComparisonLimitations({
  comparison,
  limitations,
  unsupportedMessage,
}: EvidenceComparisonLimitationsProps) {
  const { t } = useTranslation();
  const items = comparison?.limitations ?? limitations;

  function localizeLimitation(item: string): string {
    const map: Record<string, string> = {
      "Evidence Comparison shows readiness differences only — not ordinals, evaluative metrics, or investment advice.":
        t("evidenceComparisonUi.limReadinessOnly"),
      "Comparison notes describe connection posture — never superiority, inferiority, or policy judgment.":
        t("evidenceComparisonUi.limNotesPosture"),
      "Shared indicators derive from the Global Indicator Framework for this entity type.":
        t("evidenceComparisonUi.limSharedFramework"),
      "Human review is required before using comparison output in any decision context.":
        t("evidenceComparisonUi.limHumanBeforeCompare"),
      "Static export — per-entity evidence binding may expand in future releases.":
        t("evidenceComparisonUi.limStaticBinding"),
      "Comparison requires at least two profiles of the same type.":
        t("evidenceComparisonUi.requiresTwo"),
    };
    return map[item] ?? item;
  }

  return (
    <section className="space-y-4" aria-labelledby="comparison-limitations-heading">
      <div>
        <h4
          id="comparison-limitations-heading"
          className="text-sm font-semibold uppercase tracking-wider text-[var(--cbai-text-muted)]"
        >
          {t("evidenceComparisonUi.beforeDecide")}
        </h4>
      </div>

      {unsupportedMessage ? (
        <div className="rounded-xl border border-dashed border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
          <p className="text-sm text-[var(--cbai-text-secondary)]">{unsupportedMessage}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-[color-mix(in_srgb,var(--cbai-status-warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--cbai-status-warning)_5%,transparent)] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cbai-status-warning)]">
          {t("evidenceComparisonUi.humanReviewRequired")}
        </p>
        <p className="mt-2 text-sm text-[var(--cbai-text-secondary)]">{t("evidenceComparisonUi.humanReviewBody")}</p>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--cbai-text-muted)]">
        {items.map((item) => (
          <li key={item}>{localizeLimitation(item)}</li>
        ))}
      </ul>
    </section>
  );
}
