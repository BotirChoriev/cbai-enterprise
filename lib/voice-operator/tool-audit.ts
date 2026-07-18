/** Voice tool audit — no raw audio, no secrets. */

import type { VoiceToolName } from "@/lib/voice-operator/tool-policy";

export type VoiceToolAuditEvent = {
  readonly sessionId: string;
  readonly tool: VoiceToolName;
  readonly scope: string;
  readonly parametersSummary: string;
  readonly resultState: "success" | "blocked" | "error" | "consent_required";
  readonly consentState: "granted" | "pending" | "revoked" | "not_applicable";
  readonly at: string;
};

const auditLog: VoiceToolAuditEvent[] = [];

export function recordVoiceToolAudit(event: Omit<VoiceToolAuditEvent, "at">): void {
  auditLog.push({ ...event, at: new Date().toISOString() });
  if (auditLog.length > 200) auditLog.shift();
}

export function readVoiceToolAudit(sessionId?: string): readonly VoiceToolAuditEvent[] {
  return sessionId ? auditLog.filter((e) => e.sessionId === sessionId) : [...auditLog];
}

export function clearVoiceToolAuditForTests(): void {
  auditLog.length = 0;
}
