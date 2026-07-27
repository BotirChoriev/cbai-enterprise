"use client";

import type { ComparisonCandidate } from "@/lib/evidence-comparison";
import { useTranslation } from "@/lib/i18n/use-translation";

type EvidenceComparisonSelectorProps = {
  leftLegacyId: string;
  candidates: readonly ComparisonCandidate[];
  selectedLegacyId: string | null;
  onSelect: (legacyId: string) => void;
  disabled?: boolean;
};

export default function EvidenceComparisonSelector({
  candidates,
  selectedLegacyId,
  onSelect,
  disabled = false,
}: EvidenceComparisonSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-5 py-4">
      <label htmlFor="comparison-target-select" className="block text-sm font-medium text-[var(--cbai-text-secondary)]">
        {t("evidenceComparisonUi.compareWith")}
      </label>
      <p className="mt-1 text-xs text-[var(--cbai-text-muted)]">{t("evidenceComparisonUi.compareHint")}</p>
      <select
        id="comparison-target-select"
        value={selectedLegacyId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled || candidates.length === 0}
        className="mt-3 w-full rounded-lg border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 py-2 text-sm text-[var(--cbai-text-primary)] outline-none focus:border-[var(--cbai-border-active)] focus:ring-1 focus:ring-[var(--cbai-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {candidates.map((candidate) => (
          <option key={candidate.entityId} value={candidate.legacyId}>
            {candidate.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
