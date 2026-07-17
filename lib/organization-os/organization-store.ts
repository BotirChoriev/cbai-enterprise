/**
 * EPIC-05 — Organization store (device-local, empty by default).
 */

import type { Organization, OrganizationKind } from "@/lib/organization-os/organization.types";
import type { OrganizationIdentityKind } from "@/lib/organization-os/organization-identity.types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const STORAGE_KEY = "cbai-organizations";
const memoryOrganizations: Organization[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isOrganizationKind(value: unknown): value is OrganizationKind {
  return typeof value === "string";
}

function isOrganization(value: unknown): value is Organization {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Organization;
  return typeof v.id === "string" && typeof v.name === "string" && typeof v.kind === "string";
}

function normalizeOrganization(org: Organization): Organization {
  return {
    ...org,
    identityKind: org.identityKind ?? "workspace_organization",
    version: org.version ?? 1,
  };
}

export function loadOrganizations(): readonly Organization[] {
  if (!isBrowser()) return memoryOrganizations.map(normalizeOrganization);
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOrganization).map(normalizeOrganization);
  } catch {
    return [];
  }
}

export function loadOrganization(organizationId: string): Organization | null {
  return loadOrganizations().find((o) => o.id === organizationId) ?? null;
}

export function saveOrganization(organization: Organization): void {
  const normalized = normalizeOrganization(organization);
  if (!isBrowser()) {
    const index = memoryOrganizations.findIndex((o) => o.id === normalized.id);
    if (index >= 0) memoryOrganizations[index] = normalized;
    else memoryOrganizations.push(normalized);
    return;
  }
  const all = [...loadOrganizations()];
  const index = all.findIndex((o) => o.id === normalized.id);
  if (index >= 0) all[index] = normalized;
  else all.push(normalized);
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(all));
}

export function clearOrganizationsForTests(): void {
  memoryOrganizations.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(STORAGE_KEY));
}

function newOrgId(): string {
  return `org-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createOrganizationDraft(
  name: string,
  kind: OrganizationKind,
  missionStatement: string | null = null,
  extras: {
    readonly identityKind?: OrganizationIdentityKind;
    readonly website?: string | null;
    readonly country?: string | null;
    readonly createdBy?: string | null;
  } = {},
): Organization {
  const now = new Date().toISOString();
  return {
    id: newOrgId(),
    name: name.trim(),
    kind: isOrganizationKind(kind) ? kind : "other",
    identityKind: extras.identityKind ?? "workspace_organization",
    missionStatement,
    website: extras.website ?? null,
    country: extras.country ?? null,
    createdBy: extras.createdBy ?? null,
    version: 1,
    createdAt: now,
    updatedAt: now,
    maturity: "device_local",
  };
}

export const ORGANIZATION_STORE_NOTE =
  "Organizations are stored on this device only. No cloud sync, membership, or messaging is connected in EPIC-05 foundation.";
