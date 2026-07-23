import {
  createEmptyAssistantProfile,
  type AssistantProfile,
  type WorkspaceRole,
  type ThemeMode,
  type UserDensityMode,
  WORKSPACE_ROLES,
  ASSISTANT_AVATARS,
} from "@/lib/assistant/assistant-profile";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { getSyncedCloudUserId } from "@/lib/supabase/cloud-session-sync";
import { upsertCloudProfile } from "@/lib/supabase/cloud-profile";

const ASSISTANT_STORAGE_KEY = "cbai-assistant-profile";
const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];
const DENSITY_MODES: readonly UserDensityMode[] = ["focused", "standard", "expert"];

function isDensityMode(value: unknown): value is UserDensityMode {
  return typeof value === "string" && (DENSITY_MODES as string[]).includes(value);
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return typeof value === "string" && (WORKSPACE_ROLES as string[]).includes(value);
}

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && (THEME_MODES as string[]).includes(value);
}

function sanitizeProfile(raw: unknown): AssistantProfile {
  const fallback = createEmptyAssistantProfile();
  if (typeof raw !== "object" || raw === null) {
    return fallback;
  }
  const candidate = raw as Partial<AssistantProfile>;

  return {
    name: typeof candidate.name === "string" ? candidate.name : fallback.name,
    operatorName:
      typeof candidate.operatorName === "string" ? candidate.operatorName : fallback.operatorName,
    avatar:
      typeof candidate.avatar === "string" &&
      (ASSISTANT_AVATARS as string[]).includes(candidate.avatar)
        ? candidate.avatar
        : fallback.avatar,
    voiceInputEnabled:
      typeof candidate.voiceInputEnabled === "boolean"
        ? candidate.voiceInputEnabled
        : fallback.voiceInputEnabled,
    preferredLanguage:
      typeof candidate.preferredLanguage === "string"
        ? candidate.preferredLanguage
        : fallback.preferredLanguage,
    translationLanguage:
      typeof candidate.translationLanguage === "string"
        ? candidate.translationLanguage
        : fallback.translationLanguage,
    speechLanguage:
      typeof candidate.speechLanguage === "string"
        ? candidate.speechLanguage
        : fallback.speechLanguage,
    workspaceRole: isWorkspaceRole(candidate.workspaceRole)
      ? candidate.workspaceRole
      : fallback.workspaceRole,
    timezone: typeof candidate.timezone === "string" ? candidate.timezone : fallback.timezone,
    country: typeof candidate.country === "string" ? candidate.country : fallback.country,
    organization:
      typeof candidate.organization === "string" ? candidate.organization : fallback.organization,
    notifications: {
      evidenceUpdates: Boolean(candidate.notifications?.evidenceUpdates),
      missionActivity: Boolean(candidate.notifications?.missionActivity),
      weeklySummary: Boolean(candidate.notifications?.weeklySummary),
    },
    accessibility: {
      reducedMotion: Boolean(candidate.accessibility?.reducedMotion),
      highContrast: Boolean(candidate.accessibility?.highContrast),
      largerText: Boolean(candidate.accessibility?.largerText),
    },
    themeMode: isThemeMode(candidate.themeMode) ? candidate.themeMode : fallback.themeMode,
    displayDensity: isDensityMode(candidate.displayDensity)
      ? candidate.displayDensity
      : fallback.displayDensity,
  };
}

/** Load the local Assistant profile — an honest empty profile until the user sets one up.
 * Real-user-namespaced (Real Supabase Authentication + Cloud Persistence mission): a signed-in
 * identity's Assistant profile no longer leaks into another identity's on the same browser. */
export function loadAssistantProfile(): AssistantProfile {
  if (!isBrowser()) return createEmptyAssistantProfile();
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(ASSISTANT_STORAGE_KEY));
    if (!raw) return createEmptyAssistantProfile();
    return sanitizeProfile(JSON.parse(raw));
  } catch {
    return createEmptyAssistantProfile();
  }
}

/** Saves locally (unchanged, always) and — when a cloud session is active — also upserts the
 * subset of fields the `profiles` table owns (Phase 12). Fire-and-forget: preference sync failure
 * is not treated as data loss the way Project mutations are (no outbox/retry queue here), since
 * the local save above always succeeds first and is never blocked on the network. */
export function saveAssistantProfile(profile: AssistantProfile): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(resolveStorageKey(ASSISTANT_STORAGE_KEY), JSON.stringify(profile));

  const cloudUserId = getSyncedCloudUserId();
  if (!cloudUserId) return;
  void upsertCloudProfile(cloudUserId, {
    displayName: profile.name,
    assistantName: profile.name,
    avatarMode: profile.avatar,
    preferredLanguage: profile.preferredLanguage,
    workspaceRole: profile.workspaceRole,
    country: profile.country,
    timezone: profile.timezone,
    organization: profile.organization,
    accessibilityPreferences: profile.accessibility,
  });
}

export function clearAssistantProfile(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(ASSISTANT_STORAGE_KEY));
}

export const ASSISTANT_PROFILE_ARCHITECTURE_NOTE =
  "The Assistant profile is saved to this browser, namespaced to whichever identity is signed in " +
  "(device-local or cloud). Signed into a cloud account, these preferences also sync to your " +
  "profile there; otherwise they stay on this device only. Nothing here is a fabricated user record.";
