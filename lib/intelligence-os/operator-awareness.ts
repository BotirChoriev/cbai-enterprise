/**
 * Operator awareness — deterministic interventions from real mission state only.
 * Never speaks unnecessarily; each message maps to a real gap or next action.
 */

import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { deriveEvidencePulse } from "@/lib/intelligence-os/evidence-pulse";
import { loadHumanImpactForMission } from "@/lib/intelligence-os/human-impact-store";
import { loadProjectEvidence, loadProjectQuestions, loadProjects } from "@/lib/project/project-store";

export type OperatorIntervention = {
  readonly id: string;
  readonly priority: "critical" | "attention" | "context";
  readonly messageKey:
    | "noMissionDefined"
    | "needIndependentSources"
    | "weakEvidence"
    | "impactIncomplete"
    | "unresolvedQuestions"
    | "needSourceUrls"
    | "missingKnowledge"
    | "similarProblem";
  readonly href?: string;
};

export function deriveOperatorInterventions(): readonly OperatorIntervention[] {
  const mission = loadCurrentMission();
  const interventions: OperatorIntervention[] = [];

  if (!mission) {
    interventions.push({
      id: "no-mission",
      priority: "attention",
      messageKey: "noMissionDefined",
      href: "/",
    });
    return interventions;
  }

  const pulse = deriveEvidencePulse(mission);
  const impact = loadHumanImpactForMission(mission.id);
  const project = mission.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;

  if (pulse.state === "missing" || pulse.count === 0) {
    interventions.push({
      id: "missing-evidence",
      priority: "critical",
      messageKey: "needIndependentSources",
      href: mission.projectId ? `/my-work?project=${mission.projectId}#project-evidence` : "/my-work",
    });
  } else if (pulse.state === "unverified" || pulse.state === "partial") {
    interventions.push({
      id: "weak-evidence",
      priority: "attention",
      messageKey: "weakEvidence",
      href: mission.projectId ? `/my-work?project=${mission.projectId}#project-evidence` : "/knowledge",
    });
  }

  if (!impact?.isComplete) {
    interventions.push({
      id: "impact-incomplete",
      priority: "critical",
      messageKey: "impactIncomplete",
      href: mission.projectId ? `/my-work?project=${mission.projectId}#human-impact` : "/",
    });
  }

  if (project) {
    const openQuestions = loadProjectQuestions(project.id).filter((q) => !q.resolved);
    if (openQuestions.length > 0 && mission.evidenceMissing) {
      interventions.push({
        id: "unresolved-questions",
        priority: "context",
        messageKey: "unresolvedQuestions",
        href: `/my-work?project=${project.id}#project-questions`,
      });
    }
    const evidence = loadProjectEvidence(project.id);
    if (evidence.length >= 2 && evidence.every((e) => !e.sourceUrl?.trim())) {
      interventions.push({
        id: "no-source-urls",
        priority: "attention",
        messageKey: "needSourceUrls",
        href: `/my-work?project=${project.id}#project-evidence`,
      });
    }
  }

  if (mission.evidenceMissing && interventions.every((i) => i.id !== "missing-evidence")) {
    interventions.push({
      id: "missing-knowledge",
      priority: "context",
      messageKey: "missingKnowledge",
      href: "/graph",
    });
  }

  return interventions.slice(0, 3);
}
