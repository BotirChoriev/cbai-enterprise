/**
 * Unified Genesis audit trail reader (device-local + org audit when available).
 */

import {
  genesisId,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { loadOrganizationAudit } from "@/lib/organization-os/organization-audit-store";
import type { GenesisAuditRecord } from "@/lib/genesis/genesis-types";

const AUDIT_KEY = "cbai-genesis-audit";
const memoryAudit: GenesisAuditRecord[] = [];

function isAudit(v: unknown): v is GenesisAuditRecord {
  const a = v as GenesisAuditRecord;
  return typeof a?.id === "string" && typeof a?.action === "string";
}

export function recordGenesisAudit(
  input: Omit<GenesisAuditRecord, "id" | "timestamp">,
): GenesisAuditRecord {
  const record: GenesisAuditRecord = {
    ...input,
    id: genesisId("gaudit"),
    timestamp: new Date().toISOString(),
  };
  const all = readGenesisList(AUDIT_KEY, isAudit, memoryAudit);
  writeGenesisList(AUDIT_KEY, [...all, record].slice(-500), memoryAudit);
  return record;
}

export function loadGenesisAudit(filters?: {
  organizationId?: string;
  missionId?: string;
}): GenesisAuditRecord[] {
  let all = readGenesisList(AUDIT_KEY, isAudit, memoryAudit);
  if (filters?.organizationId) all = all.filter((a) => a.organizationId === filters.organizationId);
  if (filters?.missionId) all = all.filter((a) => a.missionId === filters.missionId);
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function loadUnifiedAuditTrail(organizationId?: string): {
  genesis: GenesisAuditRecord[];
  organization: ReturnType<typeof loadOrganizationAudit>;
  limitation: string;
} {
  return {
    genesis: loadGenesisAudit(organizationId ? { organizationId } : undefined),
    organization: organizationId ? loadOrganizationAudit(organizationId) : loadOrganizationAudit(),
    limitation: "Genesis audit is device-local. Organization audit mirrors cloud when Supabase is configured.",
  };
}
