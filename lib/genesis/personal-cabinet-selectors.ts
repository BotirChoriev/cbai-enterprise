/**
 * Personal Cabinet selectors — derived from real local records only.
 */

import { loadMissions, loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import { loadProjects, loadProjectTasks, loadProjectEvidence, loadProjectNotes } from "@/lib/project/project-store";
import { loadOrganizationMemberships } from "@/lib/organization-os/organization-membership-store";
import { getMissionNextAction } from "@/lib/intelligence-os/mission-lifecycle";
import { loadExecutionTasks, loadDirectives } from "@/lib/genesis/execution-store";
import { loadTeams } from "@/lib/genesis/team-store";
import { loadLivingResearchObjects } from "@/lib/genesis/living-research-object-store";
import { loadOpportunities, loadFundingNeeds } from "@/lib/genesis/opportunity-store";
import { loadContributionClaims, loadRecognitionRecords } from "@/lib/genesis/contribution-store";
import { loadCapabilityRecords } from "@/lib/genesis/capability-records-store";
import { loadProgressUpdates } from "@/lib/genesis/progress-update-store";
import { loadOpenBlockers } from "@/lib/genesis/blocker-store";
import { loadOutcomes } from "@/lib/genesis/outcome-store";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { DEFAULT_OPERATOR_NAME } from "@/lib/assistant/assistant-profile";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export type PersonalCabinetAttentionItem = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly kind:
    | "progress"
    | "blocker"
    | "human_decision"
    | "evidence"
    | "outcome"
    | "contribution"
    | "recognition"
    | "overdue"
    | "general";
};

export type PersonalCabinetSnapshot = {
  readonly activeMission: {
    mission: Mission | null;
    projectTitle: string | null;
    stage: string;
    nextAction: { label: string; href: string } | null;
  };
  readonly missions: {
    active: Mission[];
    incomplete: Mission[];
    completed: Mission[];
    archived: Mission[];
  };
  readonly work: {
    projectCount: number;
    openTaskCount: number;
    evidenceRefCount: number;
    noteCount: number;
    researchObjectCount: number;
  };
  readonly responsibilities: {
    assignedTasks: ReturnType<typeof loadExecutionTasks>;
    overdueTasks: ReturnType<typeof loadExecutionTasks>;
    blockedTasks: ReturnType<typeof loadExecutionTasks>;
    pendingReviewTasks: ReturnType<typeof loadExecutionTasks>;
  };
  readonly teams: ReturnType<typeof loadTeams>;
  readonly memberships: ReturnType<typeof loadOrganizationMemberships>;
  readonly capability: {
    passport: ReturnType<typeof buildCapabilityPassport>;
    records: ReturnType<typeof loadCapabilityRecords>;
  };
  readonly opportunities: ReturnType<typeof loadOpportunities>;
  readonly fundingNeeds: ReturnType<typeof loadFundingNeeds>;
  readonly attention: {
    items: string[];
    structured: PersonalCabinetAttentionItem[];
    nextAction: { label: string; href: string } | null;
  };
  readonly limitation: string;
};

function missionArchiveState(m: Mission): "active" | "incomplete" | "completed" | "archived" {
  if (m.status === "completed") return "completed";
  if (m.status === "paused") return "archived";
  if (!m.projectId) return "incomplete";
  if (m.status === "draft") return "incomplete";
  return "active";
}

function tasksNeedingProgress(): ReturnType<typeof loadExecutionTasks> {
  const weekAgo = Date.now() - 7 * 86400000;
  return loadExecutionTasks().filter((t) => {
    if (t.status === "Completed" || t.status === "Cancelled") return false;
    const latest = loadProgressUpdates({ taskId: t.id })[0];
    return !latest || new Date(latest.reportedDate).getTime() < weekAgo;
  });
}

export function buildPersonalCabinetSnapshot(operatorName?: string): PersonalCabinetSnapshot {
  const missions = loadMissions();
  const projects = loadProjects();
  const allTasks = projects.flatMap((p) => loadProjectTasks(p.id));
  const evidenceCount = projects.reduce((n, p) => n + loadProjectEvidence(p.id).length, 0);
  const noteCount = projects.reduce((n, p) => n + loadProjectNotes(p.id).length, 0);
  const execTasks = loadExecutionTasks();
  const now = Date.now();

  const openBlockers = loadOpenBlockers();
  const blockedTaskIds = new Set(openBlockers.map((b) => b.taskId));

  const overdueTasks = execTasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline).getTime() < now &&
      t.status !== "Completed" &&
      t.status !== "Cancelled" &&
      !blockedTaskIds.has(t.id) &&
      t.status !== "Blocked",
  );
  const blockedTasks = execTasks.filter(
    (t) => t.status === "Blocked" || blockedTaskIds.has(t.id) || Boolean(t.blocker),
  );
  const pendingReview = execTasks.filter((t) => t.approvalState === "pending" || t.status === "Awaiting Review");
  const needsProgress = tasksNeedingProgress();
  const missingCompletionEvidence = execTasks.filter(
    (t) => t.status === "Active" && t.evidenceRequirement && !t.completionEvidence,
  );

  const structured: PersonalCabinetAttentionItem[] = [];
  const attention: string[] = [];

  for (const t of needsProgress.slice(0, 3)) {
    structured.push({
      id: `progress-${t.id}`,
      kind: "progress",
      label: `Task needs progress update: ${t.title}`,
      href: "/organization",
    });
  }
  if (needsProgress.length > 0) {
    attention.push(`${needsProgress.length} task(s) may need a progress update.`);
  }

  for (const b of openBlockers.slice(0, 3)) {
    structured.push({
      id: `blocker-${b.id}`,
      kind: b.blockerType === "Human Decision Required" ? "human_decision" : "blocker",
      label: `Blocker: ${b.description.slice(0, 80)}`,
      href: "/organization",
    });
  }
  if (openBlockers.length > 0) {
    attention.push(`${openBlockers.length} open blocker(s).`);
  }

  if (blockedTasks.length > 0) {
    attention.push(`${blockedTasks.length} blocked task(s) — distinct from ${overdueTasks.length} overdue.`);
  }
  if (overdueTasks.length > 0) {
    attention.push(`${overdueTasks.length} overdue task(s) (not blocked).`);
  }
  if (missingCompletionEvidence.length > 0) {
    attention.push(`${missingCompletionEvidence.length} task(s) missing completion evidence.`);
    structured.push({
      id: "evidence-missing",
      kind: "evidence",
      label: "Completion evidence missing on active tasks",
      href: "/organization",
    });
  }

  const outcomesMissingEvidence = loadOutcomes().filter(
    (o) => o.verificationStatus === "Draft" || o.verificationStatus === "Evidence Missing",
  );
  if (outcomesMissingEvidence.length > 0) {
    attention.push(`${outcomesMissingEvidence.length} outcome(s) missing evidence.`);
    structured.push({
      id: "outcome-evidence",
      kind: "outcome",
      label: "Outcome evidence missing",
      href: "/my-work",
    });
  }

  const outcomesAwaitingReview = loadOutcomes().filter(
    (o) => o.verificationStatus === "Submitted for Review",
  );
  if (outcomesAwaitingReview.length > 0) {
    attention.push(`${outcomesAwaitingReview.length} outcome(s) awaiting review.`);
    structured.push({
      id: "outcome-review",
      kind: "outcome",
      label: "Outcome awaiting human review",
      href: "/my-work",
    });
  }

  const pendingContributions = loadContributionClaims().filter(
    (c) => c.state === "Under Review" || c.state === "Claimed" || c.state === "Evidence Submitted",
  );
  if (pendingContributions.length > 0) {
    attention.push(`${pendingContributions.length} contribution claim(s) awaiting review.`);
    structured.push({
      id: "contrib-review",
      kind: "contribution",
      label: "Contribution claim awaiting review",
      href: "/my-work",
    });
  }

  const pendingRecognition = loadRecognitionRecords().filter(
    (r) =>
      r.status === "Draft" ||
      r.status === "Evidence Incomplete" ||
      r.status === "Under Independent Review",
  );
  if (pendingRecognition.length > 0) {
    attention.push(`${pendingRecognition.length} recognition record(s) awaiting review.`);
    structured.push({
      id: "recog-review",
      kind: "recognition",
      label: "Recognition awaiting review",
      href: "/my-work",
    });
  }

  const fundingGaps = loadFundingNeeds().filter((f) => f.readinessStatus === "Evidence Incomplete");
  if (fundingGaps.length > 0) attention.push(`${fundingGaps.length} funding need(s) with evidence gaps.`);

  const current = loadCurrentMission();
  const next = current ? getMissionNextAction(current) : null;
  const currentProject = current?.projectId
    ? loadProjects().find((p) => p.id === current.projectId) ?? null
    : null;

  return {
    activeMission: {
      mission: current ?? null,
      projectTitle: currentProject?.title ?? null,
      stage: current?.status ?? "none",
      nextAction: next ? { label: next.nextAction, href: next.href } : null,
    },
    missions: {
      active: missions.filter((m) => missionArchiveState(m) === "active"),
      incomplete: missions.filter((m) => missionArchiveState(m) === "incomplete"),
      completed: missions.filter((m) => missionArchiveState(m) === "completed"),
      archived: missions.filter((m) => missionArchiveState(m) === "archived"),
    },
    work: {
      projectCount: projects.length,
      openTaskCount: allTasks.filter((t) => t.status !== "done").length,
      evidenceRefCount: evidenceCount,
      noteCount,
      researchObjectCount: loadLivingResearchObjects().length,
    },
    responsibilities: {
      assignedTasks: execTasks,
      overdueTasks,
      blockedTasks,
      pendingReviewTasks: pendingReview,
    },
    teams: loadTeams(),
    memberships: loadOrganizationMemberships(),
    capability: {
      passport: buildCapabilityPassport(operatorName ?? DEFAULT_OPERATOR_NAME),
      records: loadCapabilityRecords(),
    },
    opportunities: loadOpportunities(),
    fundingNeeds: loadFundingNeeds(),
    attention: {
      items: attention,
      structured: structured.slice(0, 6),
      nextAction: next ? { label: next.nextAction, href: next.href } : null,
    },
    limitation:
      "Personal Cabinet shows device-local records. Cloud team isolation applies only when Supabase is configured.",
  };
}

export function loadDirectivesForMission(missionId: string) {
  return loadDirectives().filter((d) => d.missionId === missionId);
}
