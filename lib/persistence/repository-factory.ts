/**
 * BUILD-039 — Resolve persistence adapters by capability.
 */

import { DeviceLocalOrganizationRepository } from "@/lib/persistence/device-local-organization-adapter";
import { DeviceLocalCollaborationRepository } from "@/lib/persistence/device-local-collaboration-adapter";
import { SupabaseOrganizationRepository } from "@/lib/persistence/supabase-organization-adapter";
import type { OrganizationRepository } from "@/lib/persistence/organization-repository.types";
import type { CollaborationRepository } from "@/lib/persistence/collaboration-repository.types";
import { isOrganizationCollaborationShared } from "@/lib/persistence/persistence-capability";

let cachedOrgRepo: OrganizationRepository | null = null;
let cachedCollabRepo: CollaborationRepository | null = null;

export function resolveOrganizationRepository(): OrganizationRepository {
  if (cachedOrgRepo) return cachedOrgRepo;
  cachedOrgRepo = isOrganizationCollaborationShared()
    ? new SupabaseOrganizationRepository()
    : new DeviceLocalOrganizationRepository();
  return cachedOrgRepo;
}

export function resolveCollaborationRepository(): CollaborationRepository {
  if (cachedCollabRepo) return cachedCollabRepo;
  cachedCollabRepo = new DeviceLocalCollaborationRepository();
  return cachedCollabRepo;
}

export function __resetRepositoryFactoryForTests(): void {
  cachedOrgRepo = null;
  cachedCollabRepo = null;
}
