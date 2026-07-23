/**
 * Cross-organization isolation helpers.
 */

import { loadMembershipForUser } from "@/lib/organization-os/organization-membership-store";
import { loadOrganization } from "@/lib/organization-os/organization-store";

export function assertUserBelongsToOrganization(
  userId: string,
  organizationId: string,
): { ok: true } | { ok: false; error: string } {
  const org = loadOrganization(organizationId);
  if (!org) return { ok: false, error: "Organization not found." };
  const membership = loadMembershipForUser(userId, organizationId);
  if (!membership) {
    return { ok: false, error: "Access denied — user is not a member of this organization." };
  }
  return { ok: true };
}

export function filterByOrganizationMembership<T extends { readonly organizationId: string }>(
  userId: string,
  items: readonly T[],
): T[] {
  return items.filter((item) => Boolean(loadMembershipForUser(userId, item.organizationId)));
}

export function organizationsVisibleToUser(userId: string, organizationIds: readonly string[]): string[] {
  return organizationIds.filter((id) => Boolean(loadMembershipForUser(userId, id)));
}
