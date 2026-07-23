/**
 * Organization locations foundation for the Digital Twin.
 * Starts empty — no fabricated sites or coordinates.
 */

import type { OrganizationLocation } from "@/lib/digital-twin/types";

export const DIGITAL_TWIN_LOCATIONS_STORAGE_KEY = "cbai-digital-twin-locations";

export type OrganizationLocationDraft = {
  readonly organizationId: string;
  readonly name: string;
  readonly kind?: OrganizationLocation["kind"];
  readonly regionLabel?: string | null;
  readonly addressLine?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** In-memory + optional device-local list. Never seeds fake locations. */
let memoryLocations: OrganizationLocation[] = [];

export function listOrganizationLocations(organizationId?: string): readonly OrganizationLocation[] {
  if (!organizationId) return memoryLocations;
  return memoryLocations.filter((loc) => loc.organizationId === organizationId);
}

export function createOrganizationLocation(draft: OrganizationLocationDraft): OrganizationLocation {
  const name = draft.name.trim();
  if (!name) {
    throw new Error("Location name is required — refusing empty fabricated location.");
  }
  const orgId = draft.organizationId.trim();
  if (!orgId) {
    throw new Error("organizationId is required — locations are organization-scoped.");
  }
  const stamp = nowIso();
  const location: OrganizationLocation = {
    id: newId(),
    organizationId: orgId,
    name,
    kind: draft.kind ?? "other",
    regionLabel: draft.regionLabel?.trim() || null,
    addressLine: draft.addressLine?.trim() || null,
    latitude: draft.latitude ?? null,
    longitude: draft.longitude ?? null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  memoryLocations = [...memoryLocations, location];
  return location;
}

export function clearOrganizationLocationsForTests(): void {
  memoryLocations = [];
}

export function locationsFoundationSummary(organizationId: string): {
  readonly count: number;
  readonly empty: boolean;
  readonly note: string;
} {
  const locations = listOrganizationLocations(organizationId);
  return {
    count: locations.length,
    empty: locations.length === 0,
    note:
      locations.length === 0
        ? "No organization locations yet — add real sites when available; none are fabricated."
        : `${locations.length} location(s) registered for this organization.`,
  };
}
