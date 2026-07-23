/** In-process audit log for connector actions. */

import type { AuditLogEntry } from "@/lib/official-connectors/types";

const MAX_ENTRIES = 500;
const entries: AuditLogEntry[] = [];

export function appendAudit(entry: Omit<AuditLogEntry, "at"> & { at?: string }): void {
  entries.push({
    ...entry,
    at: entry.at ?? new Date().toISOString(),
  });
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
}

export function listAuditLog(limit = 100): readonly AuditLogEntry[] {
  return entries.slice(-limit);
}

export function clearAuditLog(): void {
  entries.length = 0;
}
