import type {
  DecisionReadinessStatus,
  EvidenceCoverageReport,
} from "@/lib/decision-intelligence/decision-types";

/** Human-readable readiness label — factual, not evaluative. */
export function decisionReadinessLabel(status: DecisionReadinessStatus): string {
  switch (status) {
    case "insufficient_evidence":
      return "Insufficient evidence — decision context cannot be reviewed meaningfully";
    case "partial_evidence":
      return "Partial evidence — gaps must be disclosed before review";
    case "ready_for_review":
      return "Ready for human review — evidence mapped, oversight required";
    case "verified_evidence":
      return "Verified evidence — official sources connected and validated";
  }
}

/**
 * Assess readiness from factual coverage — never produces recommendations.
 * verified_evidence requires all slots available AND all sources connected and verified.
 */
export function assessDecisionReadiness(
  coverage: EvidenceCoverageReport,
): DecisionReadinessStatus {
  if (coverage.totalRequired === 0) {
    return "insufficient_evidence";
  }

  const allSourcesConnected =
    coverage.officialSources.length > 0 &&
    coverage.officialSources.every((source) => source.connectionStatus === "connected");

  const allSourcesVerified =
    allSourcesConnected &&
    coverage.officialSources.every((source) => source.verificationStatus === "verified");

  if (
    coverage.availableCount === coverage.totalRequired &&
    allSourcesVerified
  ) {
    return "verified_evidence";
  }

  if (coverage.coverageRatio >= 0.75 && coverage.missingCount === 0) {
    return "ready_for_review";
  }

  if (coverage.availableCount === 0) {
    return "insufficient_evidence";
  }

  if (coverage.coverageRatio < 0.75) {
    return "partial_evidence";
  }

  return "ready_for_review";
}

/** Standard limitations appended to every decision context in static export. */
export function buildStandardLimitations(
  readinessStatus: DecisionReadinessStatus,
): string[] {
  const base = [
    "Decision Intelligence Foundation organizes evidence only — it does not generate recommendations.",
    "All conclusions require human review with methodology verification.",
    "Static export — no live evidence ingestion or runtime validation.",
  ];

  switch (readinessStatus) {
    case "insufficient_evidence":
      return [
        ...base,
        "Required evidence is largely unavailable — review should not proceed without source connection.",
      ];
    case "partial_evidence":
      return [
        ...base,
        "Evidence gaps remain — missing indicators and sources must be disclosed to reviewers.",
      ];
    case "ready_for_review":
      return [
        ...base,
        "Evidence mapping is complete for declared indicators — human reviewer must verify before use.",
      ];
    case "verified_evidence":
      return [
        ...base,
        "Source verification status reflects infrastructure registry — reviewer must confirm applicability.",
      ];
  }
}
