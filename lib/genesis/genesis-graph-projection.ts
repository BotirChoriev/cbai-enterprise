/**
 * Genesis graph projection adapter — nodes and edges from real stored Genesis records only.
 * Does not modify the Living Graph store; provides honest capability state for Genesis integration.
 */

import { loadDirectives, loadExecutionTasks, loadMeetings, loadDecisions } from "@/lib/genesis/execution-store";
import { loadLivingResearchObjects } from "@/lib/genesis/living-research-object-store";
import { loadOpportunities, loadFundingNeeds } from "@/lib/genesis/opportunity-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";
import { loadContributionClaims, loadRecognitionRecords } from "@/lib/genesis/contribution-store";
import { loadOpenBlockers } from "@/lib/genesis/blocker-store";
import { loadMissions } from "@/lib/intelligence-os/mission-store";
import { loadProjects } from "@/lib/project/project-store";
import { loadTeams } from "@/lib/genesis/team-store";

export type GenesisGraphNodeType =
  | "Mission"
  | "Project"
  | "Organization"
  | "Team"
  | "Meeting"
  | "Decision"
  | "Directive"
  | "Task"
  | "ResearchObject"
  | "Opportunity"
  | "FundingNeed"
  | "Outcome"
  | "Contribution"
  | "Recognition"
  | "Blocker";

export type GenesisGraphNode = {
  readonly id: string;
  readonly nodeType: GenesisGraphNodeType;
  readonly label: string;
  readonly recordId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly organizationId?: string | null;
};

export type GenesisGraphEdgeType =
  | "HAS_PROJECT"
  | "OWNS_MISSION"
  | "PRODUCED_DECISION"
  | "CREATED_DIRECTIVE"
  | "HAS_TASK"
  | "CONNECTED_TO_MISSION"
  | "SEEKS_CAPABILITY"
  | "SUPPORTS_PROJECT"
  | "CLAIMS_OUTCOME"
  | "RECOGNIZES_CHANGE"
  | "BLOCKS_TASK";

export type GenesisGraphEdge = {
  readonly id: string;
  readonly edgeType: GenesisGraphEdgeType;
  readonly sourceId: string;
  readonly targetId: string;
  readonly evidenceCount: number;
};

export type GenesisGraphProjection = {
  readonly nodes: readonly GenesisGraphNode[];
  readonly edges: readonly GenesisGraphEdge[];
  readonly emptyReason: string | null;
  readonly limitation: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
};

function nodeId(type: GenesisGraphNodeType, recordId: string): string {
  return `genesis:${type}:${recordId}`;
}

export function buildGenesisGraphProjection(filters?: {
  organizationId?: string;
  missionId?: string;
}): GenesisGraphProjection {
  const nodes: GenesisGraphNode[] = [];
  const edges: GenesisGraphEdge[] = [];
  const orgId = filters?.organizationId;
  const missionFilter = filters?.missionId;

  const missions = loadMissions().filter((m) => !missionFilter || m.id === missionFilter);
  for (const m of missions) {
    nodes.push({
      id: nodeId("Mission", m.id),
      nodeType: "Mission",
      label: m.problem.slice(0, 80),
      recordId: m.id,
      missionId: m.id,
      projectId: m.projectId,
    });
    if (m.projectId) {
      edges.push({
        id: `e-mission-project-${m.id}`,
        edgeType: "HAS_PROJECT",
        sourceId: nodeId("Mission", m.id),
        targetId: nodeId("Project", m.projectId),
        evidenceCount: 0,
      });
    }
  }

  for (const p of loadProjects()) {
    if (missionFilter && !missions.some((m) => m.projectId === p.id)) continue;
    nodes.push({
      id: nodeId("Project", p.id),
      nodeType: "Project",
      label: p.title,
      recordId: p.id,
      projectId: p.id,
    });
  }

  for (const t of loadTeams(orgId)) {
    nodes.push({
      id: nodeId("Team", t.id),
      nodeType: "Team",
      label: t.name,
      recordId: t.id,
      organizationId: t.organizationId,
    });
    for (const mid of t.missionIds) {
      edges.push({
        id: `e-team-mission-${t.id}-${mid}`,
        edgeType: "CONNECTED_TO_MISSION",
        sourceId: nodeId("Team", t.id),
        targetId: nodeId("Mission", mid),
        evidenceCount: 0,
      });
    }
  }

  for (const meeting of loadMeetings(orgId)) {
    nodes.push({
      id: nodeId("Meeting", meeting.id),
      nodeType: "Meeting",
      label: meeting.title,
      recordId: meeting.id,
      organizationId: meeting.organizationId,
      missionId: meeting.missionId,
    });
  }

  for (const decision of loadDecisions(orgId)) {
    nodes.push({
      id: nodeId("Decision", decision.id),
      nodeType: "Decision",
      label: decision.decisionText.slice(0, 60),
      recordId: decision.id,
      organizationId: decision.organizationId,
    });
    if (decision.meetingId) {
      edges.push({
        id: `e-meeting-decision-${decision.id}`,
        edgeType: "PRODUCED_DECISION",
        sourceId: nodeId("Meeting", decision.meetingId),
        targetId: nodeId("Decision", decision.id),
        evidenceCount: decision.evidenceRefs?.length ?? 0,
      });
    }
  }

  for (const directive of loadDirectives(orgId)) {
    if (missionFilter && directive.missionId !== missionFilter) continue;
    nodes.push({
      id: nodeId("Directive", directive.id),
      nodeType: "Directive",
      label: directive.title,
      recordId: directive.id,
      organizationId: directive.organizationId,
      missionId: directive.missionId,
      projectId: directive.projectId,
    });
    if (directive.decisionId) {
      edges.push({
        id: `e-decision-directive-${directive.id}`,
        edgeType: "CREATED_DIRECTIVE",
        sourceId: nodeId("Decision", directive.decisionId),
        targetId: nodeId("Directive", directive.id),
        evidenceCount: 0,
      });
    }
  }

  for (const task of loadExecutionTasks(orgId)) {
    if (missionFilter && task.missionId !== missionFilter) continue;
    nodes.push({
      id: nodeId("Task", task.id),
      nodeType: "Task",
      label: task.title,
      recordId: task.id,
      organizationId: task.organizationId,
      missionId: task.missionId,
      projectId: task.projectId,
    });
    edges.push({
      id: `e-directive-task-${task.id}`,
      edgeType: "HAS_TASK",
      sourceId: nodeId("Directive", task.directiveId),
      targetId: nodeId("Task", task.id),
      evidenceCount: task.completionEvidence ? 1 : 0,
    });
  }

  for (const ro of loadLivingResearchObjects()) {
    if (missionFilter && ro.missionId !== missionFilter) continue;
    nodes.push({
      id: nodeId("ResearchObject", ro.id),
      nodeType: "ResearchObject",
      label: ro.title,
      recordId: ro.id,
      missionId: ro.missionId,
      projectId: ro.projectId,
    });
    if (ro.missionId) {
      edges.push({
        id: `e-ro-mission-${ro.id}`,
        edgeType: "CONNECTED_TO_MISSION",
        sourceId: nodeId("ResearchObject", ro.id),
        targetId: nodeId("Mission", ro.missionId),
        evidenceCount: ro.evidenceRefs.length,
      });
    }
  }

  for (const opp of loadOpportunities({ missionId: missionFilter })) {
    nodes.push({
      id: nodeId("Opportunity", opp.id),
      nodeType: "Opportunity",
      label: opp.title,
      recordId: opp.id,
      missionId: opp.missionId,
      projectId: opp.projectId,
      organizationId: opp.organizationId,
    });
    if (opp.missionId) {
      edges.push({
        id: `e-opp-mission-${opp.id}`,
        edgeType: "SEEKS_CAPABILITY",
        sourceId: nodeId("Opportunity", opp.id),
        targetId: nodeId("Mission", opp.missionId),
        evidenceCount: 0,
      });
    }
  }

  for (const fund of loadFundingNeeds({ missionId: missionFilter })) {
    nodes.push({
      id: nodeId("FundingNeed", fund.id),
      nodeType: "FundingNeed",
      label: fund.problem.slice(0, 60),
      recordId: fund.id,
      missionId: fund.missionId,
      projectId: fund.projectId,
    });
    if (fund.projectId) {
      edges.push({
        id: `e-fund-project-${fund.id}`,
        edgeType: "SUPPORTS_PROJECT",
        sourceId: nodeId("FundingNeed", fund.id),
        targetId: nodeId("Project", fund.projectId),
        evidenceCount: 0,
      });
    }
  }

  for (const outcome of loadOutcomes({ organizationId: orgId, missionId: missionFilter })) {
    nodes.push({
      id: nodeId("Outcome", outcome.id),
      nodeType: "Outcome",
      label: outcome.title,
      recordId: outcome.id,
      organizationId: outcome.organizationId,
      missionId: outcome.missionId,
      projectId: outcome.projectId,
    });
  }

  for (const claim of loadContributionClaims({ organizationId: orgId, missionId: missionFilter })) {
    nodes.push({
      id: nodeId("Contribution", claim.id),
      nodeType: "Contribution",
      label: claim.claimedChange.slice(0, 60),
      recordId: claim.id,
      organizationId: claim.organizationId,
      missionId: claim.missionId,
    });
    if (claim.outcomeId) {
      edges.push({
        id: `e-contrib-outcome-${claim.id}`,
        edgeType: "CLAIMS_OUTCOME",
        sourceId: nodeId("Contribution", claim.id),
        targetId: nodeId("Outcome", claim.outcomeId),
        evidenceCount: claim.evidenceRefs.length,
      });
    }
  }

  for (const rec of loadRecognitionRecords()) {
    nodes.push({
      id: nodeId("Recognition", rec.id),
      nodeType: "Recognition",
      label: rec.subject,
      recordId: rec.id,
      missionId: rec.missionId,
    });
    if (rec.contributionIds.length > 0) {
      edges.push({
        id: `e-recog-contrib-${rec.id}`,
        edgeType: "RECOGNIZES_CHANGE",
        sourceId: nodeId("Recognition", rec.id),
        targetId: nodeId("Contribution", rec.contributionIds[0]!),
        evidenceCount: rec.evidenceSources.length,
      });
    }
  }

  for (const blocker of loadOpenBlockers(orgId)) {
    if (blocker.taskId) {
      edges.push({
        id: `e-blocker-task-${blocker.id}`,
        edgeType: "BLOCKS_TASK",
        sourceId: nodeId("Task", blocker.taskId),
        targetId: nodeId("Task", blocker.taskId),
        evidenceCount: blocker.evidenceRefs?.length ?? 0,
      });
    }
  }

  const uniqueNodes = [...new Map(nodes.map((n) => [n.id, n])).values()];
  const emptyReason = uniqueNodes.length === 0 ? "No Genesis records stored yet." : null;

  return {
    nodes: uniqueNodes,
    edges,
    emptyReason,
    limitation:
      "Genesis graph adapter projects device-local records only. Living Graph core remains separate until unified rendering is safe.",
    nodeCount: uniqueNodes.length,
    edgeCount: edges.length,
  };
}
