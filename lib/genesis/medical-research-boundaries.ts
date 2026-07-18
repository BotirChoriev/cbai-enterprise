/**
 * Medical and scientific safety stage boundaries — no clinical decision-making.
 */

export const MEDICAL_RESEARCH_STAGES = [
  "Concept",
  "Laboratory",
  "Preclinical",
  "Clinical Research",
  "Regulatory Review",
  "Approved Use",
  "Withdrawn",
  "Unknown",
] as const;

export type MedicalResearchStage = (typeof MEDICAL_RESEARCH_STAGES)[number];

export type MedicalSafetyAssessment = {
  readonly stage: MedicalResearchStage;
  readonly mayClaimEfficacy: boolean;
  readonly requiresQualifiedReview: boolean;
  readonly limitation: string;
};

export function assessMedicalResearchStage(stage: MedicalResearchStage): MedicalSafetyAssessment {
  switch (stage) {
    case "Approved Use":
      return {
        stage,
        mayClaimEfficacy: true,
        requiresQualifiedReview: true,
        limitation: "Approved use still requires cited regulatory evidence — CBAI does not replace regulators.",
      };
    case "Clinical Research":
    case "Regulatory Review":
      return {
        stage,
        mayClaimEfficacy: false,
        requiresQualifiedReview: true,
        limitation: "Clinical or regulatory stage — efficacy claims require qualified human review and evidence.",
      };
    case "Preclinical":
    case "Laboratory":
    case "Concept":
      return {
        stage,
        mayClaimEfficacy: false,
        requiresQualifiedReview: true,
        limitation: "Preclinical or early stage — human efficacy must not be claimed without appropriate evidence.",
      };
    case "Withdrawn":
      return {
        stage,
        mayClaimEfficacy: false,
        requiresQualifiedReview: true,
        limitation: "Withdrawn — preserve adverse and negative evidence; do not suppress.",
      };
    default:
      return {
        stage: "Unknown",
        mayClaimEfficacy: false,
        requiresQualifiedReview: true,
        limitation: "Stage unknown — treat all efficacy claims as unverified.",
      };
  }
}

export function validateEfficacyClaim(input: {
  stage: MedicalResearchStage;
  claimText: string;
}): { allowed: boolean; reason: string } {
  const assessment = assessMedicalResearchStage(input.stage);
  const efficacyPattern = /\b(cure[sd]?|treat(s|ment)?|efficac(y|ious)|approved for patients|safe and effective)\b/i;
  if (efficacyPattern.test(input.claimText) && !assessment.mayClaimEfficacy) {
    return {
      allowed: false,
      reason: `Efficacy language is not permitted at stage "${input.stage}". ${assessment.limitation}`,
    };
  }
  return { allowed: true, reason: "Claim within stage boundaries or no efficacy language detected." };
}
