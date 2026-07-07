"use client";

import { useMemo, useState } from "react";
import type { ComparisonEntityType, EvidenceComparisonModel } from "@/lib/evidence-comparison";
import { buildEvidenceComparisonModel, defaultComparisonTarget } from "@/lib/evidence-comparison";
import EvidenceComparisonSelector from "@/components/evidence-comparison/EvidenceComparisonSelector";
import EvidenceComparisonSummary from "@/components/evidence-comparison/EvidenceComparisonSummary";
import EvidenceComparisonMatrix from "@/components/evidence-comparison/EvidenceComparisonMatrix";
import EvidenceComparisonGaps from "@/components/evidence-comparison/EvidenceComparisonGaps";
import EvidenceComparisonLimitations from "@/components/evidence-comparison/EvidenceComparisonLimitations";
import { sanitizeUserMessage } from "@/components/shared/user-facing-copy";

type EvidenceComparisonPanelProps = {
  entityType: ComparisonEntityType;
  leftLegacyId: string;
  initialModel: EvidenceComparisonModel;
};

export default function EvidenceComparisonPanel({
  entityType,
  leftLegacyId,
  initialModel,
}: EvidenceComparisonPanelProps) {
  const defaultTarget = defaultComparisonTarget(initialModel.context)?.legacyId ?? null;
  const [selectedLegacyId, setSelectedLegacyId] = useState<string | null>(defaultTarget);

  const model = useMemo(
    () => buildEvidenceComparisonModel(entityType, leftLegacyId, selectedLegacyId),
    [entityType, leftLegacyId, selectedLegacyId],
  );

  const { context, comparison, unsupportedMessage } = model;
  const userUnsupportedMessage = sanitizeUserMessage(unsupportedMessage);

  return (
    <section className="space-y-6" aria-label="Evidence comparison">
      {!context.comparisonAvailable ? (
        <EvidenceComparisonLimitations
          comparison={null}
          limitations={[
            "Comparison requires at least two profiles of the same type.",
          ]}
          unsupportedMessage={sanitizeUserMessage(context.unavailableReason)}
        />
      ) : (
        <>
          <EvidenceComparisonSelector
            leftLegacyId={leftLegacyId}
            candidates={context.candidates}
            selectedLegacyId={selectedLegacyId}
            onSelect={setSelectedLegacyId}
          />

          {comparison ? (
            <>
              <EvidenceComparisonSummary comparison={comparison} />
              <EvidenceComparisonMatrix comparison={comparison} />
              <EvidenceComparisonGaps comparison={comparison} />
              <EvidenceComparisonLimitations
                comparison={comparison}
                limitations={comparison.limitations.map((item) =>
                  sanitizeUserMessage(item) ?? item,
                )}
                unsupportedMessage={userUnsupportedMessage}
              />
            </>
          ) : (
            <EvidenceComparisonLimitations
              comparison={null}
              limitations={[]}
              unsupportedMessage={
                userUnsupportedMessage ?? "Comparison is not available for these profiles."
              }
            />
          )}
        </>
      )}
    </section>
  );
}
