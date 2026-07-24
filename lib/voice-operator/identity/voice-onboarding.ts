/**
 * Versioned Voice first-run onboarding — no audio stored; local only.
 */

import { CBAI_IDENTITY_VERSION } from "@/lib/voice-operator/identity/cbai-identity";

const STORAGE_KEY = "cbai-voice-onboarding";

export type VoiceOnboardingState = {
  readonly introVersion: number;
  readonly completedAt: string | null;
};

function emptyState(): VoiceOnboardingState {
  return { introVersion: 0, completedAt: null };
}

export function readVoiceOnboardingState(): VoiceOnboardingState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<VoiceOnboardingState>;
    return {
      introVersion: typeof parsed.introVersion === "number" ? parsed.introVersion : 0,
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : null,
    };
  } catch {
    return emptyState();
  }
}

/** Idempotent: never deletes; upgrades introVersion when user completes current intro. */
export function migrateVoiceOnboardingState(raw: unknown): VoiceOnboardingState {
  if (!raw || typeof raw !== "object") return emptyState();
  const obj = raw as Record<string, unknown>;
  const introVersion = typeof obj.introVersion === "number" ? obj.introVersion : 0;
  const completedAt = typeof obj.completedAt === "string" ? obj.completedAt : null;
  return { introVersion, completedAt };
}

export function needsVoiceFirstRunIntro(): boolean {
  const state = readVoiceOnboardingState();
  return state.introVersion < CBAI_IDENTITY_VERSION;
}

export function markVoiceFirstRunIntroComplete(): VoiceOnboardingState {
  const next: VoiceOnboardingState = {
    introVersion: CBAI_IDENTITY_VERSION,
    completedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }
  return next;
}

export function resetVoiceOnboardingForTests(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
