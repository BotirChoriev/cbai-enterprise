import type { TrustLevel } from "@/lib/intelligence/trust.types";
import {
  resolveTrustPermissions,
  TRUST_LEVEL_MODERATE_MIN,
  TRUST_LEVEL_VERIFIED_MIN,
} from "@/lib/intelligence/trust/levels";
import type { TrustQualityIntegrationContext } from "@/lib/intelligence/trust/quality-integration";

/** Minimum trust level required for recommendation permission. */
export const GOVERNANCE_MIN_RECOMMENDATION_LEVEL: TrustLevel = "moderate";

/** Minimum trust level required for execution permission. */
export const GOVERNANCE_MIN_EXECUTION_LEVEL: TrustLevel = "verified";

/**
 * Governance gate metadata attached to {@link TrustAssessment}.
 */
export interface TrustGovernanceGate {
  /** Whether all requested governance checks passed. */
  passed: boolean;
  automationPermitted: boolean;
  recommendationPermitted: boolean;
  executionPermitted: boolean;
  minimumLevels: {
    recommendation: TrustLevel;
    execution: TrustLevel;
  };
  blockedActions: string[];
}

/**
 * Resolve whether trust level meets minimum requirement.
 */
export function trustLevelMeetsMinimum(
  level: TrustLevel,
  minimum: TrustLevel,
): boolean {
  const order: TrustLevel[] = [
    "unverified",
    "low",
    "moderate",
    "high",
    "verified",
  ];

  return order.indexOf(level) >= order.indexOf(minimum);
}

/**
 * Apply governance rules to trust permissions after level resolution.
 *
 * Recommendation requires at least moderate trust.
 * Execution requires verified trust.
 * Low quality evidence blocks automation.
 */
export function applyGovernanceGates(
  trustLevel: TrustLevel,
  trustScore: number,
  qualityContext: TrustQualityIntegrationContext,
): {
  permissions: {
    allowAutomation: boolean;
    allowRecommendation: boolean;
    allowExecution: boolean;
  };
  governanceGate: TrustGovernanceGate;
} {
  const base = resolveTrustPermissions(trustLevel);
  const blockedActions: string[] = [];

  let allowAutomation = base.allowAutomation;
  let allowRecommendation = base.allowRecommendation;
  let allowExecution = base.allowExecution;

  if (!trustLevelMeetsMinimum(trustLevel, GOVERNANCE_MIN_RECOMMENDATION_LEVEL)) {
    allowRecommendation = false;
    blockedActions.push("recommendation-requires-moderate-trust");
  }

  if (!trustLevelMeetsMinimum(trustLevel, GOVERNANCE_MIN_EXECUTION_LEVEL)) {
    allowExecution = false;
    blockedActions.push("execution-requires-verified-trust");
  }

  if (qualityContext.hasLowQuality || qualityContext.hasWeakProvenance) {
    allowAutomation = false;
    blockedActions.push("automation-blocked-evidence-quality");
  }

  if (!qualityContext.isKnown) {
    allowAutomation = false;
    blockedActions.push("automation-blocked-quality-unknown");
  }

  if (trustScore < TRUST_LEVEL_MODERATE_MIN) {
    allowRecommendation = false;
  }

  if (trustScore < TRUST_LEVEL_VERIFIED_MIN) {
    allowExecution = false;
    allowAutomation = false;
  }

  const passed = blockedActions.length === 0;

  return {
    permissions: {
      allowAutomation,
      allowRecommendation,
      allowExecution,
    },
    governanceGate: {
      passed,
      automationPermitted: allowAutomation,
      recommendationPermitted: allowRecommendation,
      executionPermitted: allowExecution,
      minimumLevels: {
        recommendation: GOVERNANCE_MIN_RECOMMENDATION_LEVEL,
        execution: GOVERNANCE_MIN_EXECUTION_LEVEL,
      },
      blockedActions,
    },
  };
}

/**
 * Extend trust reason with governance and quality context.
 */
export function buildGovernanceTrustReason(
  baseReason: string,
  qualityContext: TrustQualityIntegrationContext,
  governanceGate: TrustGovernanceGate,
): string {
  const parts = [baseReason];

  if (!qualityContext.isKnown) {
    parts.push("Evidence quality summary unavailable — trust reduced conservatively.");
  }

  if (qualityContext.trustPenalty > 0) {
    parts.push(
      `Quality penalty of ${qualityContext.trustPenalty} points applied to trust score.`,
    );
  }

  if (governanceGate.blockedActions.length > 0) {
    parts.push(
      `Governance blocks: ${governanceGate.blockedActions.join(", ")}.`,
    );
  }

  return parts.join(" ");
}
