/**
 * READ / navigate actions — authorized device and org-scoped stores only.
 * Never bypasses org membership checks used by underlying stores.
 */

import { loadMissionEngineRuntimes } from "@/lib/mission-engine";
import { loadApprovalsForUser } from "@/lib/enterprise-collaboration/approval-store";
import type { EnterpriseApproval } from "@/lib/enterprise-collaboration/types";
import { loadMentionsForUser } from "@/lib/enterprise-collaboration/mention-store";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import { loadActiveEnterpriseContext } from "@/lib/enterprise-collaboration/active-context";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";
import { resolveActorId } from "@/lib/persistence/resolve-actor-id";
import { recordAssistantActionAudit } from "@/lib/digital-assistant-actions/audit";
import type {
  AssistantActionResult,
  MentionListItem,
  MissionListItem,
  MissingEvidenceItem,
  OrgActivitySummary,
  PendingApprovalItem,
} from "@/lib/digital-assistant-actions/types";

/** Allowed navigation targets for the assistant (honest platform routes). */
export const ASSISTANT_NAV_TARGETS: readonly { readonly href: string; readonly label: string; readonly patterns: readonly RegExp[] }[] = [
  { href: "/missions", label: "Missions", patterns: [/\bmissions?\b/i] },
  { href: "/approvals", label: "Approvals", patterns: [/\bapprovals?\b/i] },
  { href: "/notifications", label: "Notifications", patterns: [/\b(notifications?|mentions?)\b/i] },
  { href: "/evidence", label: "Evidence", patterns: [/\bevidence\b/i] },
  { href: "/reports", label: "Reports", patterns: [/\breports?\b/i] },
  { href: "/reports/builder", label: "Report builder", patterns: [/\breport builder\b/i] },
  { href: "/my-work", label: "My Work", patterns: [/\bmy work\b/i] },
  { href: "/enterprise", label: "Enterprise", patterns: [/\benterprise\b/i, /\borganization\b/i] },
  { href: "/activity", label: "Activity", patterns: [/\bactivity\b/i] },
  { href: "/", label: "Home", patterns: [/\bhome\b/i] },
];

export type ReadActionDeps = {
  readonly actorId?: string | null;
  readonly listMissions?: () => readonly MissionListItem[];
  readonly listPendingApprovals?: (userId: string) => readonly PendingApprovalItem[];
  readonly listMentions?: (userId: string) => readonly MentionListItem[];
  readonly orgActivity?: (userId: string | null) => OrgActivitySummary;
  readonly missingEvidence?: () => readonly MissingEvidenceItem[];
};

function defaultListMissions(): MissionListItem[] {
  return loadMissionEngineRuntimes().map((r) => ({
    missionId: r.missionId,
    stage: r.stage,
    taskCount: r.tasks.length,
    updatedAt: r.updatedAt,
  }));
}

function defaultListPendingApprovals(userId: string): PendingApprovalItem[] {
  return loadApprovalsForUser(userId)
    .filter((a): a is EnterpriseApproval & { status: "pending" } => a.status === "pending" && a.assignedTo === userId)
    .map((a) => ({
      id: a.id,
      title: a.title,
      organizationId: a.organizationId,
      status: "pending" as const,
      assignedTo: a.assignedTo,
      createdAt: a.createdAt,
    }));
}

function defaultListMentions(userId: string): MentionListItem[] {
  return loadMentionsForUser(userId).map((m) => ({
    id: m.id,
    organizationId: m.organizationId,
    mentionedBy: m.mentionedBy,
    targetType: m.targetType,
    targetId: m.targetId,
    createdAt: m.createdAt,
    unread: !m.readAt,
  }));
}

function defaultOrgActivity(userId: string | null): OrgActivitySummary {
  const isolationNote =
    "Org activity summary never includes organizations you are not a member of.";
  if (!userId) {
    return {
      organizationId: null,
      eventCount: 0,
      recentEvents: [],
      isolationNote,
    };
  }
  const active = loadActiveEnterpriseContext();
  let organizationId = active.organizationId;
  if (organizationId && !loadMembershipForUser(userId, organizationId)) {
    organizationId = null;
  }
  const events = organizationId ? loadOrganizationAudit(organizationId) : [];
  return {
    organizationId,
    eventCount: events.length,
    recentEvents: events.slice(0, 8).map((e) => ({
      event: e.event,
      actorDisplayName: e.actorDisplayName,
      timestamp: e.timestamp,
    })),
    isolationNote,
  };
}

function defaultMissingEvidence(): MissingEvidenceItem[] {
  const items: MissingEvidenceItem[] = [];
  for (const runtime of loadMissionEngineRuntimes()) {
    for (const req of runtime.evidenceRequirements) {
      if (req.required && !req.satisfied) {
        items.push({
          missionId: runtime.missionId,
          requirementId: req.id,
          description: req.description,
          evidenceId: req.evidenceId,
        });
      }
    }
  }
  return items;
}

function actor(deps?: ReadActionDeps): string | null {
  return deps?.actorId !== undefined ? deps.actorId : resolveActorId();
}

export function listMissionsAction(deps?: ReadActionDeps): AssistantActionResult {
  const items = (deps?.listMissions ?? defaultListMissions)();
  const actorId = actor(deps);
  const outcome = items.length === 0 ? "empty" : "completed";
  recordAssistantActionAudit({
    kind: "list_missions",
    mode: "read",
    outcome,
    actorId,
    detail: `Listed ${items.length} mission runtime(s)`,
  });
  return {
    kind: "list_missions",
    mode: "read",
    outcome,
    confirmationRequired: false,
    assistantText:
      items.length === 0
        ? "No mission engine runtimes on this device yet."
        : `Missions (${items.length}):\n${items
            .slice(0, 10)
            .map((m) => `• ${m.missionId} — stage ${m.stage}, ${m.taskCount} task(s)`)
            .join("\n")}`,
    href: "/missions",
    data: items,
  };
}

export function listPendingApprovalsAction(deps?: ReadActionDeps): AssistantActionResult {
  const actorId = actor(deps);
  if (!actorId) {
    recordAssistantActionAudit({
      kind: "list_pending_approvals",
      mode: "read",
      outcome: "blocked",
      actorId: null,
      detail: "No actor — cannot list approvals",
    });
    return {
      kind: "list_pending_approvals",
      mode: "read",
      outcome: "blocked",
      confirmationRequired: false,
      assistantText: "Sign in to view pending approvals. Approvals stay org-scoped.",
      href: "/approvals",
    };
  }
  const items = (deps?.listPendingApprovals ?? defaultListPendingApprovals)(actorId);
  const outcome = items.length === 0 ? "empty" : "completed";
  recordAssistantActionAudit({
    kind: "list_pending_approvals",
    mode: "read",
    outcome,
    actorId,
    detail: `Listed ${items.length} pending approval(s)`,
  });
  return {
    kind: "list_pending_approvals",
    mode: "read",
    outcome,
    confirmationRequired: false,
    assistantText:
      items.length === 0
        ? "No pending approvals assigned to you."
        : `Pending approvals (${items.length}):\n${items
            .slice(0, 10)
            .map((a) => `• ${a.title} (${a.id})`)
            .join("\n")}\nNever auto-approved.`,
    href: "/approvals",
    data: items,
  };
}

export function listMentionsAction(deps?: ReadActionDeps): AssistantActionResult {
  const actorId = actor(deps);
  if (!actorId) {
    recordAssistantActionAudit({
      kind: "list_mentions",
      mode: "read",
      outcome: "blocked",
      actorId: null,
      detail: "No actor — cannot list mentions",
    });
    return {
      kind: "list_mentions",
      mode: "read",
      outcome: "blocked",
      confirmationRequired: false,
      assistantText: "Sign in to view mentions. Mentions are organization-membership gated.",
      href: "/notifications",
    };
  }
  const items = (deps?.listMentions ?? defaultListMentions)(actorId);
  const unread = items.filter((m) => m.unread).length;
  const outcome = items.length === 0 ? "empty" : "completed";
  recordAssistantActionAudit({
    kind: "list_mentions",
    mode: "read",
    outcome,
    actorId,
    detail: `Listed ${items.length} mention(s), ${unread} unread`,
  });
  return {
    kind: "list_mentions",
    mode: "read",
    outcome,
    confirmationRequired: false,
    assistantText:
      items.length === 0
        ? "No mentions for you in organizations you belong to."
        : `Mentions (${items.length}, ${unread} unread):\n${items
            .slice(0, 10)
            .map((m) => `• from ${m.mentionedBy} on ${m.targetType}/${m.targetId}${m.unread ? " (unread)" : ""}`)
            .join("\n")}`,
    href: "/notifications",
    data: items,
  };
}

export function orgActivitySummaryAction(deps?: ReadActionDeps): AssistantActionResult {
  const actorId = actor(deps);
  const summary = (deps?.orgActivity ?? defaultOrgActivity)(actorId);
  const outcome = summary.eventCount === 0 ? "empty" : "completed";
  recordAssistantActionAudit({
    kind: "org_activity_summary",
    mode: "read",
    outcome,
    actorId,
    detail: `Org activity events=${summary.eventCount} org=${summary.organizationId ?? "none"}`,
  });
  const lines =
    summary.recentEvents.length === 0
      ? ["No organization audit events visible for your active org."]
      : summary.recentEvents.map((e) => `• ${e.event} — ${e.actorDisplayName} @ ${e.timestamp}`);
  return {
    kind: "org_activity_summary",
    mode: "read",
    outcome,
    confirmationRequired: false,
    assistantText: [
      `Organization activity summary (${summary.eventCount} event(s)):`,
      ...lines,
      summary.isolationNote,
    ].join("\n"),
    href: "/activity",
    data: summary,
  };
}

export function missingEvidenceAction(deps?: ReadActionDeps): AssistantActionResult {
  const items = (deps?.missingEvidence ?? defaultMissingEvidence)();
  const actorId = actor(deps);
  const outcome = items.length === 0 ? "empty" : "completed";
  recordAssistantActionAudit({
    kind: "missing_evidence",
    mode: "read",
    outcome,
    actorId,
    detail: `Missing evidence requirements=${items.length}`,
  });
  return {
    kind: "missing_evidence",
    mode: "read",
    outcome,
    confirmationRequired: false,
    assistantText:
      items.length === 0
        ? "No unsatisfied required evidence on mission runtimes."
        : `Missing required evidence (${items.length}):\n${items
            .slice(0, 12)
            .map((i) => `• mission ${i.missionId}: ${i.description}`)
            .join("\n")}`,
    href: "/evidence",
    data: items,
  };
}

export function resolveNavigateHref(raw: string): { href: string; label: string } | null {
  const text = raw.trim().toLowerCase();
  if (!/\b(go to|open|navigate|show|take me to)\b/i.test(text) && !/^\/[a-z]/.test(text)) {
    // Allow bare "open missions" etc. when a known module keyword is present with open/go.
    if (!/\b(open|go|show)\b/i.test(text)) return null;
  }
  for (const target of ASSISTANT_NAV_TARGETS) {
    if (target.patterns.some((p) => p.test(text))) {
      return { href: target.href, label: target.label };
    }
  }
  // Explicit path if it matches an allowed target exactly.
  const pathMatch = text.match(/(\/[a-z0-9/_-]+)/i);
  if (pathMatch) {
    const href = pathMatch[1]!;
    const allowed = ASSISTANT_NAV_TARGETS.find((t) => t.href === href);
    if (allowed) return { href: allowed.href, label: allowed.label };
  }
  return null;
}

export function navigateAction(raw: string, deps?: ReadActionDeps): AssistantActionResult | null {
  const target = resolveNavigateHref(raw);
  if (!target) return null;
  const actorId = actor(deps);
  recordAssistantActionAudit({
    kind: "navigate",
    mode: "navigate",
    outcome: "completed",
    actorId,
    detail: `Navigate to ${target.href}`,
  });
  return {
    kind: "navigate",
    mode: "navigate",
    outcome: "completed",
    confirmationRequired: false,
    assistantText: `Opening ${target.label} (${target.href}).`,
    href: target.href,
    data: target,
  };
}
