/**
 * EPIC-05 — Organization Inspector derivation from real mission/project data.
 */

import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { deriveEvidenceRuntime } from "@/lib/evidence-runtime/evidence-runtime";
import { deriveCollaborationGuidance } from "@/lib/intelligence-os/ambient-collaboration";
import type { Mission } from "@/lib/intelligence-os/mission.types";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import { deriveReportReadiness } from "@/lib/intelligence-os/report-readiness";
import { deriveCapabilityRequirements } from "@/lib/organization-os/capability-matching";
import { emptyDecisionLedger } from "@/lib/organization-os/decision-ledger.types";
import { deriveOrganizationWorkspace } from "@/lib/organization-os/organization-workspace";
import { loadProjectQuestions } from "@/lib/project/project-store";

export type OrganizationInspectorSurface = {
  readonly missionHealth: string;
  readonly evidenceQuality: string;
  readonly knowledgeContribution: string;
  readonly capabilityCoverage: string;
  readonly humanImpact: string;
  readonly trust: string;
  readonly unknowns: readonly string[];
  readonly decisionBacklog: number;
  readonly maturity: string;
  readonly limitation: string;
};

export function deriveOrganizationInspector(
  mission: Mission | null,
  operatorLabel = "Operator",
): OrganizationInspectorSurface {
  const workspace = deriveOrganizationWorkspace();
  const ledger = emptyDecisionLedger();
  const matching = deriveCapabilityRequirements(mission);
  const collaboration = deriveCollaborationGuidance(mission);

  if (!mission) {
    return {
      missionHealth: "No active mission",
      evidenceQuality: "Not evaluated",
      knowledgeContribution: "No contributions indexed",
      capabilityCoverage: "Not evaluated",
      humanImpact: "Not reviewed",
      trust: "Mission context required",
      unknowns: ["Active mission not set"],
      decisionBacklog: ledger.backlogCount,
      maturity: workspace.maturity,
      limitation: workspace.limitation,
    };
  }

  const runtime = deriveEvidenceRuntime(mission, mission.projectId);
  const questions = mission.projectId ? loadProjectQuestions(mission.projectId) : [];
  const openQuestions = questions.filter((q) => !q.resolved);
  const impact = loadHumanImpactForMission(mission.id);
  const readiness = mission.projectId ? deriveReportReadiness(mission.projectId) : null;
  const passport = buildCapabilityPassport(operatorLabel);

  const unknowns: string[] = [];
  if (mission.evidenceMissing.trim()) unknowns.push(mission.evidenceMissing.trim());
  if (openQuestions.length > 0) unknowns.push(`${openQuestions.length} open question(s)`);
  if (!impact?.isComplete) unknowns.push("Human impact review incomplete");
  if (readiness && !readiness.canClaimReadiness) unknowns.push(readiness.limitation);

  return {
    missionHealth: `${mission.status}: ${mission.problem}`,
    evidenceQuality: `${runtime.consensus} — ${runtime.records.length} reference(s). ${runtime.limitation}`,
    knowledgeContribution: `${questions.length} question(s); capability signals: ${passport.totalSignals}`,
    capabilityCoverage: matching.explanation,
    humanImpact: impact?.isComplete ? "Impact review recorded" : "Impact review pending",
    trust: collaboration?.whyRelevant ?? runtime.limitation,
    unknowns,
    decisionBacklog: ledger.backlogCount,
    maturity: workspace.maturity,
    limitation:
      "Organization inspector uses real mission and device-local records only. Teams, messaging, and cloud sync are not connected.",
  };
}
