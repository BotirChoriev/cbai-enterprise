/**
 * Active enterprise context — selected org / product workspace / mission.
 * Product workspaces (investor/government/citizen) are lenses, not tenants.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type { ActiveEnterpriseContext } from "@/lib/enterprise-collaboration/types";
import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";

const KEY = "cbai-active-enterprise-context";
let memory: ActiveEnterpriseContext | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function empty(): ActiveEnterpriseContext {
  return {
    organizationId: null,
    workspaceId: null,
    missionId: null,
    updatedAt: new Date().toISOString(),
  };
}

function isContext(v: unknown): v is ActiveEnterpriseContext {
  const c = v as ActiveEnterpriseContext;
  return (
    typeof c === "object" &&
    c !== null &&
    (c.organizationId === null || typeof c.organizationId === "string") &&
    (c.workspaceId === null ||
      c.workspaceId === "government" ||
      c.workspaceId === "investor" ||
      c.workspaceId === "citizen") &&
    (c.missionId === null || typeof c.missionId === "string")
  );
}

export function loadActiveEnterpriseContext(): ActiveEnterpriseContext {
  if (!isBrowser()) return memory ?? empty();
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(KEY));
    if (!raw) return empty();
    const parsed: unknown = JSON.parse(raw);
    return isContext(parsed) ? parsed : empty();
  } catch {
    return empty();
  }
}

export function saveActiveEnterpriseContext(
  patch: Partial<Omit<ActiveEnterpriseContext, "updatedAt">>,
): ActiveEnterpriseContext {
  const next: ActiveEnterpriseContext = {
    ...loadActiveEnterpriseContext(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (!isBrowser()) {
    memory = next;
    return next;
  }
  window.localStorage.setItem(resolveStorageKey(KEY), JSON.stringify(next));
  return next;
}

/** Set org only if the actor is a member — never switches into a foreign org. */
export function setActiveOrganizationForUser(
  userId: string,
  organizationId: string | null,
): ActiveEnterpriseContext | { readonly error: string } {
  if (organizationId) {
    const membership = loadMembershipForUser(userId, organizationId);
    if (!membership) {
      return { error: "Cannot activate an organization you do not belong to." };
    }
  }
  return saveActiveEnterpriseContext({ organizationId });
}

export function clearActiveEnterpriseContextForTests(): void {
  memory = null;
  if (isBrowser()) {
    window.localStorage.removeItem(resolveStorageKey(KEY));
  }
}
