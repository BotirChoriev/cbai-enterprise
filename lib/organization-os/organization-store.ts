/**
 * EPIC-05 — Organization store (device-local, empty by default).
 */

import type { Organization, OrganizationKind } from "@/lib/organization-os/organization.types";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

const STORAGE_KEY = "cbai-organizations";

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

export function loadOrganizations(): readonly Organization[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(STORAGE_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOrganization);
  } catch {
    return [];
  }
}

export function loadOrganization(organizationId: string): Organization | null {
  return loadOrganizations().find((o) => o.id === organizationId) ?? null;
}

export function saveOrganization(organization: Organization): void {
  if (!isBrowser()) return;
  const all = [...loadOrganizations()];
  const index = all.findIndex((o) => o.id === organization.id);
  if (index >= 0) all[index] = organization;
  else all.push(organization);
  window.localStorage.setItem(resolveStorageKey(STORAGE_KEY), JSON.stringify(all));
}

function newOrgId(): string {
  return `org-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createOrganizationDraft(
  name: string,
  kind: OrganizationKind,
  missionStatement: string | null = null,
): Organization {
  const now = new Date().toISOString();
  return {
    id: newOrgId(),
    name: name.trim(),
    kind: isOrganizationKind(kind) ? kind : "other",
    missionStatement,
    createdAt: now,
    updatedAt: now,
    maturity: "device_local",
  };
}

export const ORGANIZATION_STORE_NOTE =
  "Organizations are stored on this device only. No cloud sync, membership, or messaging is connected in EPIC-05 foundation.";
