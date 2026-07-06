"use client";

import { useMemo, useState } from "react";
import type { ComparisonEntityType, EvidenceComparisonModel } from "@/lib/evidence-comparison";
import { buildEvidenceComparisonModel, defaultComparisonTarget } from "@/lib/evidence-comparison";
import EvidenceComparisonSelector from "@/components/evidence-comparison/EvidenceComparisonSelector";
import EvidenceComparisonSummary from "@/components/evidence-comparison/EvidenceComparisonSummary";
import EvidenceComparisonMatrix from "@/components/evidence-comparison/EvidenceComparisonMatrix";
import EvidenceComparisonGaps from "@/components/evidence-comparison/EvidenceComparisonGaps";
import EvidenceComparisonLimitations from "@/components/evidence-comparison/EvidenceComparisonLimitations";

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

  return (
    <section className="space-y-6" aria-labelledby="evidence-comparison-heading">
      <div>
        <h3
          id="evidence-comparison-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Evidence Comparison
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Compare evidence readiness between two {entityType} entities — not scoring, ranking, or
          investment advice.
        </p>
      </div>

      {!context.comparisonAvailable ? (
        <EvidenceComparisonLimitations
          comparison={null}
          limitations={[
            "Comparison requires at least two entities of the same type in the Global Registry.",
          ]}
          unsupportedMessage={context.unavailableReason}
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
                limitations={comparison.limitations}
                unsupportedMessage={unsupportedMessage}
              />
            </>
          ) : (
            <EvidenceComparisonLimitations
              comparison={null}
              limitations={[]}
              unsupportedMessage={unsupportedMessage ?? "Comparison could not be built."}
            />
          )}
        </>
      )}
    </section>
  );
}
