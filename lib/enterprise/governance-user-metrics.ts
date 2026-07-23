/**
 * Governance user-facing metrics — no Engine/Schema version presentation.
 * Derived from evidence infrastructure + governance rule registry honesty.
 */

import { buildGovernanceControlModel } from "@/lib/governance-control-center";
import { getInfrastructureSummary } from "@/lib/evidence-infrastructure/registry";
import { OFFICIAL_EVIDENCE_SOURCES } from "@/lib/evidence-infrastructure/sources/catalog";

export type GovernanceUserMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export function buildGovernanceUserMetrics(): readonly GovernanceUserMetric[] {
  const model = buildGovernanceControlModel();
  const infra = getInfrastructureSummary();
  const connected = infra.connectedSources;
  const missing = Math.max(0, infra.sourceCount - connected);
  const coverage =
    infra.sourceCount > 0 ? Math.round((connected / infra.sourceCount) * 100) : 0;
  const verified = OFFICIAL_EVIDENCE_SOURCES.filter(
    (s) => s.verificationStatus === "verified",
  ).length;
  const pending = OFFICIAL_EVIDENCE_SOURCES.filter(
    (s) => s.verificationStatus === "verification_pending" || s.verificationStatus === "not_started",
  ).length;

  return [
    {
      id: "evidence-coverage",
      label: "Evidence Coverage",
      value: `${coverage}%`,
      detail: `${connected} of ${infra.sourceCount} registered sources connected`,
    },
    {
      id: "confidence",
      label: "Confidence",
      value: verified > 0 ? "Partial" : "Not assessed",
      detail:
        verified > 0
          ? `${verified} source(s) marked verified in the registry`
          : "Confidence is not assessed until official sources complete verification",
    },
    {
      id: "verification-status",
      label: "Verification Status",
      value: `${verified} verified`,
      detail: `${pending} source(s) awaiting or not started verification`,
    },
    {
      id: "missing-sources",
      label: "Missing Sources",
      value: String(missing),
      detail: "Registered official sources not yet connected",
    },
    {
      id: "human-review",
      label: "Human Review Status",
      value: "Required",
      detail: "Governance rules require human review before operational decisions",
    },
    {
      id: "transparency-score",
      label: "Transparency Score",
      value: `${model.summary.totalRules} rules published`,
      detail: `${model.summary.criticalRules} critical · ${model.summary.ruleCategories} categories · ${model.summary.validationSteps} validation steps`,
    },
  ] as const;
}
