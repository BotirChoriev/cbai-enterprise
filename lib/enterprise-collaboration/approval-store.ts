/**
 * Approval workflow — organization-scoped, RBAC-gated for approve actions.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type {
  ApprovalStatus,
  CollaborationTargetType,
  EnterpriseApproval,
} from "@/lib/enterprise-collaboration/types";
import { assertUserBelongsToOrganization } from "@/lib/enterprise-collaboration/isolation";
import { evaluateOrganizationPermission } from "@/lib/organization-os/permissions-service";
import { createUserNotification } from "@/lib/notifications/user-notification-store";
import { recordOrganizationAudit } from "@/lib/organization-os/organization-audit-store";

const KEY = "cbai-enterprise-approvals";
const memory: EnterpriseApproval[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): EnterpriseApproval[] {
  if (!isBrowser()) return [...memory];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EnterpriseApproval[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: readonly EnterpriseApproval[]): void {
  if (!isBrowser()) {
    memory.length = 0;
    memory.push(...items);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(KEY), JSON.stringify(items));
}

export function requestEnterpriseApproval(input: {
  readonly organizationId: string;
  readonly requestedBy: string;
  readonly assignedTo: string;
  readonly targetType: CollaborationTargetType;
  readonly targetId: string;
  readonly title: string;
}): EnterpriseApproval | { readonly error: string } {
  const gate = assertUserBelongsToOrganization(input.requestedBy, input.organizationId);
  if (!gate.ok) return { error: gate.error };
  const assigneeGate = assertUserBelongsToOrganization(input.assignedTo, input.organizationId);
  if (!assigneeGate.ok) return { error: "Assignee must belong to the same organization." };

  const now = new Date().toISOString();
  const approval: EnterpriseApproval = {
    id: `apr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: input.organizationId,
    targetType: input.targetType,
    targetId: input.targetId,
    title: input.title.trim() || "Approval request",
    requestedBy: input.requestedBy,
    assignedTo: input.assignedTo,
    status: "pending",
    decisionNote: null,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([...readAll(), approval]);
  createUserNotification({
    recipientUserId: input.assignedTo,
    notificationType: "review_assigned",
    actorId: input.requestedBy,
    organizationId: input.organizationId,
    objectType: "approval",
    objectId: approval.id,
    safeMetadata: { title: approval.title },
  });
  recordOrganizationAudit({
    organizationId: input.organizationId,
    event: "approval_requested",
    actorId: input.requestedBy,
    actorDisplayName: input.requestedBy,
    targetId: approval.id,
    metadata: { title: approval.title },
  });
  return approval;
}

export function decideEnterpriseApproval(input: {
  readonly approvalId: string;
  readonly actorId: string;
  readonly decision: Exclude<ApprovalStatus, "pending" | "cancelled">;
  readonly note?: string | null;
}): EnterpriseApproval | { readonly error: string } {
  const all = readAll();
  const approval = all.find((a) => a.id === input.approvalId);
  if (!approval) return { error: "Approval not found." };
  if (approval.assignedTo !== input.actorId) return { error: "Not assigned to this approver." };
  const gate = assertUserBelongsToOrganization(input.actorId, approval.organizationId);
  if (!gate.ok) return { error: gate.error };
  if (!evaluateOrganizationPermission(input.actorId, approval.organizationId, "approve_internal_review")) {
    return { error: "Permission denied — approve_internal_review required." };
  }
  if (approval.status !== "pending") return { error: "Approval is no longer pending." };

  const now = new Date().toISOString();
  const updated: EnterpriseApproval = {
    ...approval,
    status: input.decision,
    decisionNote: input.note?.trim() || null,
    updatedAt: now,
  };
  writeAll(all.map((a) => (a.id === approval.id ? updated : a)));
  createUserNotification({
    recipientUserId: approval.requestedBy,
    notificationType: input.decision === "approved" ? "review_completed" : "changes_requested",
    actorId: input.actorId,
    organizationId: approval.organizationId,
    objectType: "approval",
    objectId: approval.id,
  });
  const event =
    input.decision === "approved"
      ? ("approval_approved" as const)
      : input.decision === "rejected"
        ? ("approval_rejected" as const)
        : ("approval_changes_requested" as const);
  recordOrganizationAudit({
    organizationId: approval.organizationId,
    event,
    actorId: input.actorId,
    actorDisplayName: input.actorId,
    targetId: approval.id,
    metadata: { title: approval.title, decision: input.decision },
  });
  return updated;
}

export function loadApprovalsForUser(userId: string, organizationId?: string | null): EnterpriseApproval[] {
  return readAll()
    .filter((a) => {
      if (!assertUserBelongsToOrganization(userId, a.organizationId).ok) return false;
      if (organizationId && a.organizationId !== organizationId) return false;
      return a.assignedTo === userId || a.requestedBy === userId;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countPendingApprovalsForUser(userId: string, organizationId?: string | null): number {
  return loadApprovalsForUser(userId, organizationId).filter((a) => a.status === "pending" && a.assignedTo === userId)
    .length;
}

export function clearEnterpriseApprovalsForTests(): void {
  memory.length = 0;
  if (isBrowser()) window.localStorage.removeItem(resolveStorageKey(KEY));
}
