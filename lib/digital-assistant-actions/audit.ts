/**
 * Device-local audit list for assistant-triggered actions.
 * No secrets, no raw tokens, no Production cloud write.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import type { AssistantAuditEntry, AssistantActionKind, AssistantActionMode, AssistantActionOutcome } from "@/lib/digital-assistant-actions/types";

export const ASSISTANT_ACTION_AUDIT_KEY = "cbai-digital-assistant-action-audit";
const MAX_ENTRIES = 200;

const memoryAudit: AssistantAuditEntry[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAudit(): AssistantAuditEntry[] {
  if (!isBrowser()) return [...memoryAudit];
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(ASSISTANT_ACTION_AUDIT_KEY));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is AssistantAuditEntry => {
      const r = row as AssistantAuditEntry;
      return typeof r?.id === "string" && typeof r?.kind === "string" && typeof r?.at === "string";
    });
  } catch {
    return [];
  }
}

function writeAudit(entries: readonly AssistantAuditEntry[]): void {
  const trimmed = entries.slice(-MAX_ENTRIES);
  if (!isBrowser()) {
    memoryAudit.length = 0;
    memoryAudit.push(...trimmed);
    return;
  }
  window.localStorage.setItem(resolveStorageKey(ASSISTANT_ACTION_AUDIT_KEY), JSON.stringify(trimmed));
}

export function recordAssistantActionAudit(input: {
  readonly kind: AssistantActionKind;
  readonly mode: AssistantActionMode;
  readonly outcome: AssistantActionOutcome;
  readonly actorId: string | null;
  readonly detail: string;
}): AssistantAuditEntry {
  const entry: AssistantAuditEntry = {
    id: `aaudit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    mode: input.mode,
    outcome: input.outcome,
    actorId: input.actorId,
    detail: input.detail.slice(0, 240),
    at: new Date().toISOString(),
  };
  writeAudit([...readAudit(), entry]);
  return entry;
}

export function loadAssistantActionAudit(): readonly AssistantAuditEntry[] {
  return readAudit().slice().reverse();
}

export function clearAssistantActionAuditForTests(): void {
  memoryAudit.length = 0;
  if (isBrowser()) {
    window.localStorage.removeItem(resolveStorageKey(ASSISTANT_ACTION_AUDIT_KEY));
  }
}
