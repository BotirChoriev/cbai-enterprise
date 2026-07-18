/**
 * Genesis reports — honest artifacts from real stored records only.
 */

import { loadMissions, loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { loadProjects } from "@/lib/project/project-store";
import {
  loadDirectives,
  loadExecutionTasks,
  loadDecisions,
} from "@/lib/genesis/execution-store";
import { loadProgressUpdates } from "@/lib/genesis/progress-update-store";
import { loadOpenBlockers } from "@/lib/genesis/blocker-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";
import { loadLivingResearchObjects } from "@/lib/genesis/living-research-object-store";
import { loadFundingNeeds } from "@/lib/genesis/opportunity-store";
import { deriveLeadershipMetrics } from "@/lib/genesis/monitoring-metrics";

export type GenesisReportKind =
  | "Mission Report"
  | "Project Status Report"
  | "Meeting Action Report"
  | "Directive Execution Report"
  | "Task Progress Report"
  | "Blocker Report"
  | "Evidence Coverage Report"
  | "Research Object Report"
  | "Funding Readiness Report"
  | "Outcome Report"
  | "Contribution Review Report"
  | "Leadership Brief"
  | "Recognition Evidence Package";

export type GenesisReportArtifact = {
  readonly id: string;
  readonly kind: GenesisReportKind;
  readonly title: string;
  readonly scope: string;
  readonly reportingPeriod: string;
  readonly generatedAt: string;
  readonly sourceRecordIds: readonly string[];
  readonly sections: readonly { heading: string; body: string }[];
  readonly limitations: readonly string[];
  readonly humanDecisionBoundary: string;
  readonly available: boolean;
  readonly unavailableReason?: string | null;
};

function reportId(kind: string): string {
  return `genesis-report-${kind}-${Date.now()}`;
}

const HUMAN_BOUNDARY =
  "Final scientific, medical, legal, financial, and organizational decisions remain with qualified humans.";

export function buildLeadershipBrief(organizationId: string): GenesisReportArtifact {
  const metrics = deriveLeadershipMetrics(organizationId);
  const tasks = loadExecutionTasks(organizationId);
  const blockers = loadOpenBlockers(organizationId);
  const outcomes = loadOutcomes({ organizationId });
  const now = new Date().toISOString();

  const sections = [
    {
      heading: "What was decided",
      body: `${loadDecisions(organizationId).length} decision record(s) on file.`,
    },
    {
      heading: "What is being executed",
      body: `${tasks.filter((t) => t.status === "Active").length} active task(s); ${loadDirectives(organizationId).length} directive(s).`,
    },
    {
      heading: "Blockers requiring attention",
      body: blockers.length === 0 ? "No open blockers." : blockers.map((b) => b.description.slice(0, 100)).join("; "),
    },
    {
      heading: "Outcomes",
      body: `${outcomes.filter((o) => o.verificationStatus === "Supported").length} supported; ${outcomes.filter((o) => o.verificationStatus === "Disputed").length} disputed.`,
    },
    {
      heading: "Metrics (definitions included in monitoring)",
      body: metrics.map((m) => `${m.label}: ${m.value} — ${m.definition}`).join("\n"),
    },
  ];

  return {
    id: reportId("leadership-brief"),
    kind: "Leadership Brief",
    title: "Leadership Brief",
    scope: `organization:${organizationId}`,
    reportingPeriod: "all-time (device-local)",
    generatedAt: now,
    sourceRecordIds: [
      ...tasks.slice(0, 5).map((t) => t.id),
      ...blockers.map((b) => b.id),
      ...outcomes.slice(0, 3).map((o) => o.id),
    ],
    sections,
    limitations: [
      "Device-local records only.",
      "No employee ranking or performance score.",
      "Metrics link to source records in Leadership Monitoring.",
    ],
    humanDecisionBoundary: HUMAN_BOUNDARY,
    available: tasks.length > 0 || blockers.length > 0 || outcomes.length > 0,
    unavailableReason: tasks.length === 0 && blockers.length === 0 && outcomes.length === 0 ? "No execution records yet." : null,
  };
}

export function buildMissionReport(missionId: string): GenesisReportArtifact {
  const mission = loadMissions().find((m) => m.id === missionId);
  const now = new Date().toISOString();
  if (!mission) {
    return {
      id: reportId("mission"),
      kind: "Mission Report",
      title: "Mission Report",
      scope: `mission:${missionId}`,
      reportingPeriod: "n/a",
      generatedAt: now,
      sourceRecordIds: [],
      sections: [],
      limitations: ["Mission not found."],
      humanDecisionBoundary: HUMAN_BOUNDARY,
      available: false,
      unavailableReason: "Mission record not found.",
    };
  }

  const project = mission.projectId ? loadProjects().find((p) => p.id === mission.projectId) : null;
  const researchObjects = loadLivingResearchObjects().filter((r) => r.missionId === missionId);
  const outcomes = loadOutcomes({ missionId });
  const funding = loadFundingNeeds({ missionId });

  return {
    id: reportId("mission"),
    kind: "Mission Report",
    title: `Mission Report — ${mission.problem.slice(0, 60)}`,
    scope: `mission:${missionId}`,
    reportingPeriod: "all-time (device-local)",
    generatedAt: now,
    sourceRecordIds: [mission.id, ...(project ? [project.id] : [])],
    sections: [
      { heading: "Problem", body: mission.problem },
      { heading: "Project", body: project?.title ?? "No linked project." },
      { heading: "Research objects", body: `${researchObjects.length} object(s).` },
      { heading: "Outcomes", body: `${outcomes.length} outcome record(s).` },
      { heading: "Funding needs", body: `${funding.length} need(s); gaps: ${funding.filter((f) => f.readinessStatus === "Evidence Incomplete").length}.` },
    ],
    limitations: ["Generated from device-local Genesis and Mission OS records."],
    humanDecisionBoundary: HUMAN_BOUNDARY,
    available: true,
  };
}

export function buildTaskProgressReport(organizationId: string): GenesisReportArtifact {
  const updates = loadProgressUpdates({ organizationId });
  const tasks = loadExecutionTasks(organizationId);
  const now = new Date().toISOString();

  return {
    id: reportId("task-progress"),
    kind: "Task Progress Report",
    title: "Task Progress Report",
    scope: `organization:${organizationId}`,
    reportingPeriod: "all-time (device-local)",
    generatedAt: now,
    sourceRecordIds: [...updates.slice(0, 10).map((u) => u.id), ...tasks.slice(0, 5).map((t) => t.id)],
    sections: [
      {
        heading: "Progress updates",
        body: updates.length === 0 ? "No progress updates recorded." : updates.slice(0, 5).map((u) => u.summary).join("\n"),
      },
      {
        heading: "Active tasks",
        body: `${tasks.filter((t) => t.status === "Active").length} active; ${tasks.filter((t) => t.status === "Blocked").length} blocked.`,
      },
    ],
    limitations: ["No inferred progress percentages."],
    humanDecisionBoundary: HUMAN_BOUNDARY,
    available: updates.length > 0 || tasks.length > 0,
    unavailableReason: updates.length === 0 && tasks.length === 0 ? "No tasks or progress updates." : null,
  };
}

export function buildOutcomeReport(organizationId?: string): GenesisReportArtifact {
  const outcomes = loadOutcomes(organizationId ? { organizationId } : undefined);
  const now = new Date().toISOString();

  return {
    id: reportId("outcome"),
    kind: "Outcome Report",
    title: "Outcome Report",
    scope: organizationId ? `organization:${organizationId}` : "all device-local",
    reportingPeriod: "all-time (device-local)",
    generatedAt: now,
    sourceRecordIds: outcomes.map((o) => o.id),
    sections: outcomes.slice(0, 8).map((o) => ({
      heading: o.title,
      body: `Output: ${o.outputDescription}\nOutcome: ${o.outcomeDescription}\nImpact claim: ${o.impactClaim}\nStatus: ${o.verificationStatus}`,
    })),
    limitations: ["Output does not automatically prove outcome; outcome does not automatically prove impact."],
    humanDecisionBoundary: HUMAN_BOUNDARY,
    available: outcomes.length > 0,
    unavailableReason: outcomes.length === 0 ? "No outcome records." : null,
  };
}

export function listAvailableGenesisReports(input: {
  organizationId?: string;
  missionId?: string;
}): GenesisReportArtifact[] {
  const reports: GenesisReportArtifact[] = [];
  const mission = input.missionId ?? loadCurrentMission()?.id;
  if (mission) reports.push(buildMissionReport(mission));
  if (input.organizationId) {
    reports.push(buildLeadershipBrief(input.organizationId));
    reports.push(buildTaskProgressReport(input.organizationId));
    reports.push(buildOutcomeReport(input.organizationId));
  }
  return reports;
}
