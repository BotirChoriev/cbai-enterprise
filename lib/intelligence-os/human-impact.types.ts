/**
 * Humanity Impact Engine — structured qualitative assessment, never fake scores.
 */

export type HumanImpactAssessment = {
  readonly missionId?: string;
  readonly projectId?: string;
  readonly humanBenefit: string;
  readonly possibleHarm: string;
  readonly environmentalEffect: string;
  readonly ethicalConcerns: string;
  readonly affectedCommunities: string;
  readonly longTermConsequences: string;
  readonly unknownRisks: string;
  readonly mitigation: string;
  readonly missingEvidence: string;
  readonly isComplete: boolean;
  readonly updatedAt: string;
};

export type HumanImpactDraft = Omit<HumanImpactAssessment, "isComplete" | "updatedAt">;

export function isHumanImpactComplete(draft: HumanImpactDraft): boolean {
  return (
    draft.humanBenefit.trim().length >= 5 &&
    draft.possibleHarm.trim().length >= 3 &&
    draft.environmentalEffect.trim().length >= 3 &&
    draft.unknownRisks.trim().length >= 3
  );
}
