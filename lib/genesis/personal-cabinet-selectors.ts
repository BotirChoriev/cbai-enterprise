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
import { loadContributionClaims } from "@/lib/genesis/contribution-store";
import { loadCapabilityRecords } from "@/lib/genesis/capability-records-store";
import { buildCapabilityPassport } from "@/lib/capability/capability-passport-builder";
import { DEFAULT_OPERATOR_NAME } from "@/lib/assistant/assistant-profile";
import type { Mission } from "@/lib/intelligence-os/mission.types";

export type PersonalCabinetSnapshot = {
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

export function buildPersonalCabinetSnapshot(operatorName?: string): PersonalCabinetSnapshot {
  const missions = loadMissions();
  const projects = loadProjects();
  const allTasks = projects.flatMap((p) => loadProjectTasks(p.id));
  const evidenceCount = projects.reduce((n, p) => n + loadProjectEvidence(p.id).length, 0);
  const noteCount = projects.reduce((n, p) => n + loadProjectNotes(p.id).length, 0);
  const execTasks = loadExecutionTasks();
  const now = Date.now();

  const overdueTasks = execTasks.filter(
    (t) => t.deadline && new Date(t.deadline).getTime() < now && t.status !== "Completed" && t.status !== "Cancelled",
  );
  const blockedTasks = execTasks.filter((t) => t.status === "Blocked" || Boolean(t.blocker));
  const pendingReview = execTasks.filter((t) => t.approvalState === "pending" || t.status === "Awaiting Review");

  const attention: string[] = [];
  if (blockedTasks.length > 0) attention.push(`${blockedTasks.length} blocked execution task(s).`);
  if (overdueTasks.length > 0) attention.push(`${overdueTasks.length} overdue task(s).`);
  const fundingGaps = loadFundingNeeds().filter((f) => f.readinessStatus === "Evidence Incomplete");
  if (fundingGaps.length > 0) attention.push(`${fundingGaps.length} funding need(s) with evidence gaps.`);
  const pendingContributions = loadContributionClaims().filter((c) => c.state === "Under Review" || c.state === "Claimed");
  if (pendingContributions.length > 0) attention.push(`${pendingContributions.length} contribution claim(s) awaiting review.`);

  const current = loadCurrentMission();
  const next = current ? getMissionNextAction(current) : null;

  return {
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
      nextAction: next ? { label: next.nextAction, href: next.href } : null,
    },
    limitation:
      "Personal Cabinet shows device-local records. Cloud team isolation applies only when Supabase is configured.",
  };
}

export function loadDirectivesForMission(missionId: string) {
  return loadDirectives().filter((d) => d.missionId === missionId);
}
