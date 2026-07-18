/** Session-scoped conversational memory — cleared on end session. */

import type { ConversationTurn, ExternalSearchConsentScope, VoiceSessionMemory } from "@/lib/voice-operator/types";

const SESSION_KEY = "cbai-voice-operator-session";

let memorySession: VoiceSessionMemory | null = null;

function newSessionId(): string {
  return `vos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createVoiceSessionMemory(language: string, mode: VoiceSessionMemory["mode"]): VoiceSessionMemory {
  const session: VoiceSessionMemory = {
    sessionId: newSessionId(),
    language,
    mode,
    turns: [],
    activeContextSummary: null,
    lastConfirmedQuery: null,
    presentedEvidenceIds: [],
    unresolvedClarification: null,
    externalSearchConsent: null,
    pendingDraftId: null,
    startedAt: new Date().toISOString(),
  };
  memorySession = session;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }
  return session;
}

export function readVoiceSessionMemory(): VoiceSessionMemory | null {
  if (memorySession) return memorySession;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    memorySession = JSON.parse(raw) as VoiceSessionMemory;
    return memorySession;
  } catch {
    return null;
  }
}

function writeSession(session: VoiceSessionMemory): void {
  memorySession = session;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }
}

export function appendConversationTurn(turn: Omit<ConversationTurn, "id" | "at">): VoiceSessionMemory {
  const current = readVoiceSessionMemory() ?? createVoiceSessionMemory("uz", "browser_fallback");
  const next: VoiceSessionMemory = {
    ...current,
    turns: [
      ...current.turns,
      {
        ...turn,
        id: `turn-${current.turns.length + 1}`,
        at: new Date().toISOString(),
      },
    ],
  };
  writeSession(next);
  return next;
}

export function patchVoiceSessionMemory(
  patch: Partial<
    Pick<
      VoiceSessionMemory,
      | "activeContextSummary"
      | "lastConfirmedQuery"
      | "presentedEvidenceIds"
      | "unresolvedClarification"
      | "externalSearchConsent"
      | "pendingDraftId"
    >
  >,
): VoiceSessionMemory | null {
  const current = readVoiceSessionMemory();
  if (!current) return null;
  const next = { ...current, ...patch };
  writeSession(next);
  return next;
}

export function setExternalSearchConsent(scope: ExternalSearchConsentScope): VoiceSessionMemory | null {
  return patchVoiceSessionMemory({ externalSearchConsent: scope });
}

export function clearVoiceSessionMemory(): void {
  memorySession = null;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Refresh must not replay last voice command — sessionStorage only holds memory, not executable commands. */
export function sessionHasExecutableReplay(): boolean {
  return false;
}
