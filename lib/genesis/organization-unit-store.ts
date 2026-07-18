/**
 * Organization units and departments — device-local hierarchy under Organization OS.
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";

const UNITS_KEY = "cbai-genesis-organization-units";
const memoryUnits: OrganizationUnit[] = [];

export type OrganizationUnitKind = "unit" | "department";

export type OrganizationUnit = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly kind: OrganizationUnitKind;
  readonly parentUnitId?: string | null;
  readonly description: string;
  readonly missionIds: readonly string[];
  readonly projectIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isUnit(v: unknown): v is OrganizationUnit {
  const u = v as OrganizationUnit;
  return typeof u?.id === "string" && typeof u?.organizationId === "string";
}

export function loadOrganizationUnits(organizationId?: string): OrganizationUnit[] {
  const all = readGenesisList(UNITS_KEY, isUnit, memoryUnits);
  return organizationId ? all.filter((u) => u.organizationId === organizationId) : all;
}

export function createOrganizationUnit(input: {
  organizationId: string;
  name: string;
  kind: OrganizationUnitKind;
  parentUnitId?: string | null;
  description?: string;
  missionIds?: readonly string[];
  projectIds?: readonly string[];
}): OrganizationUnit {
  const now = new Date().toISOString();
  const unit: OrganizationUnit = {
    id: genesisId("orgunit"),
    organizationId: input.organizationId,
    name: input.name.trim(),
    kind: input.kind,
    parentUnitId: input.parentUnitId ?? null,
    description: input.description?.trim() ?? "",
    missionIds: input.missionIds ?? [],
    projectIds: input.projectIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(UNITS_KEY, [...readGenesisList(UNITS_KEY, isUnit, memoryUnits), unit], memoryUnits);
  recordGenesisAudit({
    domain: "organization",
    action: "unit_created",
    recordType: "organization_unit",
    recordId: unit.id,
    actorId: "operator",
    organizationId: input.organizationId,
    newState: unit.name,
  });
  notifyGenesisChanged();
  return unit;
}

export function linkUnitToMission(unitId: string, missionId: string): OrganizationUnit | null {
  const all = readGenesisList(UNITS_KEY, isUnit, memoryUnits);
  const idx = all.findIndex((u) => u.id === unitId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (prev.missionIds.includes(missionId)) return prev;
  const updated: OrganizationUnit = {
    ...prev,
    missionIds: [...prev.missionIds, missionId],
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(UNITS_KEY, next, memoryUnits);
  notifyGenesisChanged();
  return updated;
}
