/**
 * BUILD-029 — Organization activity audit (device-local, confirmed mutations only).
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { getSharedAuditMirror } from "@/lib/persistence/shared-org-session-cache";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";

export type OrganizationAuditEventName =
  | "organization_created"
  | "organization_edited"
  | "invitation_created"
  | "invitation_accepted"
  | "invitation_declined"
  | "invitation_revoked"
  | "member_role_changed"
  | "member_removed"
  | "member_left"
  | "ownership_transferred";

export type OrganizationAuditRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly event: OrganizationAuditEventName;
  readonly actorId: string;
  readonly actorDisplayName: string;
  readonly targetId?: string | null;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly timestamp: string;
};

const AUDIT_KEY = "cbai-organization-audit";
const MAX_AUDIT = 500;

const memoryAudit: OrganizationAuditRecord[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAudit(): OrganizationAuditRecord[] {
  if (!isBrowser()) return [...memoryAudit];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(AUDIT_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is OrganizationAuditRecord => {
      const r = v as OrganizationAuditRecord;
      return typeof r?.id === "string" && typeof r?.event === "string";
    });
  } catch {
    return [];
  }
}

function writeAudit(records: readonly OrganizationAuditRecord[]): void {
  const trimmed = records.slice(-MAX_AUDIT);
  if (!isBrowser()) {
    memoryAudit.length = 0;
    memoryAudit.push(...trimmed);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(AUDIT_KEY), JSON.stringify(trimmed));
}

export function loadOrganizationAudit(organizationId?: string): OrganizationAuditRecord[] {
  if (isOrganizationCollaborationShared() && organizationId) {
    return [...(getSharedAuditMirror(organizationId) ?? [])];
  }
  const all = readAudit();
  return organizationId ? all.filter((r) => r.organizationId === organizationId) : all;
}

export function recordOrganizationAudit(
  record: Omit<OrganizationAuditRecord, "id" | "timestamp">,
): OrganizationAuditRecord {
  const full: OrganizationAuditRecord = {
    ...record,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  writeAudit([...readAudit(), full]);
  return full;
}

export function clearOrganizationAuditForTests(): void {
  memoryAudit.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(AUDIT_KEY));
}
