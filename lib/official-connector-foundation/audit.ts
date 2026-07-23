/**
 * Audit logging for connector foundation operations.
 */

import type { AuditAction, AuditLogEntry, FailureClass } from "@/lib/official-connector-foundation/types";

export class FoundationAuditLog {
  private readonly entries: AuditLogEntry[] = [];

  record(
    connectorId: string,
    action: AuditAction,
    detail: string,
    failureClass?: FailureClass
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      at: new Date().toISOString(),
      connectorId,
      action,
      detail,
      ...(failureClass ? { failureClass } : {}),
    };
    this.entries.push(entry);
    return entry;
  }

  list(): readonly AuditLogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export const foundationAuditLog = new FoundationAuditLog();
