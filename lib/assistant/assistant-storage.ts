import {
  createEmptyAssistantProfile,
  type AssistantProfile,
  type WorkspaceRole,
  WORKSPACE_ROLES,
  ASSISTANT_AVATARS,
} from "@/lib/assistant/assistant-profile";

const ASSISTANT_STORAGE_KEY = "cbai-assistant-profile";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return typeof value === "string" && (WORKSPACE_ROLES as string[]).includes(value);
}

function sanitizeProfile(raw: unknown): AssistantProfile {
  const fallback = createEmptyAssistantProfile();
  if (typeof raw !== "object" || raw === null) {
    return fallback;
  }
  const candidate = raw as Partial<AssistantProfile>;

  return {
    name: typeof candidate.name === "string" ? candidate.name : fallback.name,
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
  };
}

/** Load the local Assistant profile — an honest empty profile until the user sets one up. */
export function loadAssistantProfile(): AssistantProfile {
  if (!isBrowser()) return createEmptyAssistantProfile();
  try {
    const raw = window.localStorage.getItem(ASSISTANT_STORAGE_KEY);
    if (!raw) return createEmptyAssistantProfile();
    return sanitizeProfile(JSON.parse(raw));
  } catch {
    return createEmptyAssistantProfile();
  }
}

export function saveAssistantProfile(profile: AssistantProfile): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(profile));
}

export function clearAssistantProfile(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ASSISTANT_STORAGE_KEY);
}

export const ASSISTANT_PROFILE_ARCHITECTURE_NOTE =
  "The Assistant profile is saved to this browser only — this platform has no accounts, " +
  "authentication, or cross-device sync. Nothing here is a fabricated user record.";
