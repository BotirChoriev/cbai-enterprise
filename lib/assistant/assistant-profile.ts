/**
 * Personal Intelligence Assistant — profile model.
 *
 * This is a device-local preference set, deliberately kept separate from the real account system
 * (lib/auth/) added in the Authentication + User Platform Foundation mission: this profile is how
 * the Assistant addresses you (name, avatar, language, workspace role), while a real Account is
 * who owns your Projects and Bookmarks. A signed-in user's profile still lives in this same
 * device-local key today — profiles are not yet namespaced per-account like Projects/Bookmarks
 * are, so switching accounts on one device currently means starting the Assistant profile over.
 */

export type WorkspaceRole =
  | "citizen"
  | "student"
  | "researcher"
  | "professor"
  | "academic"
  | "engineer"
  | "investor"
  | "company"
  | "university"
  | "research_center"
  | "government"
  | "administrator";

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  citizen: "Citizen",
  student: "Student",
  researcher: "Researcher",
  professor: "Professor",
  academic: "Academic",
  engineer: "Engineer",
  investor: "Investor",
  company: "Company",
  university: "University",
  research_center: "Research Center",
  government: "Government",
  administrator: "Administrator",
};

export const WORKSPACE_ROLES: readonly WorkspaceRole[] = Object.keys(
  WORKSPACE_ROLE_LABELS,
) as WorkspaceRole[];

/**
 * Roles change only the default landing workspace — never the Intelligence Engine underneath.
 * Every route named here already exists and is unchanged by this mapping.
 */
export const ROLE_DEFAULT_WORKSPACE: Record<WorkspaceRole, string> = {
  citizen: "/citizen",
  student: "/research",
  researcher: "/research/workspace",
  professor: "/research/workspace",
  academic: "/research",
  engineer: "/research/workspace",
  investor: "/investor",
  company: "/companies",
  university: "/universities",
  research_center: "/research",
  government: "/government",
  administrator: "/dashboard",
};

export type AssistantAvatarId =
  | "cyan"
  | "violet"
  | "amber"
  | "emerald"
  | "rose"
  | "slate";

export const ASSISTANT_AVATARS: readonly AssistantAvatarId[] = [
  "cyan",
  "violet",
  "amber",
  "emerald",
  "rose",
  "slate",
];

export const ASSISTANT_AVATAR_CLASSES: Record<AssistantAvatarId, string> = {
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export type SupportedLanguageCode = "en";

export type AssistantLanguage = {
  code: string;
  label: string;
  available: boolean;
};

/**
 * Only English is implemented anywhere in this platform's UI today. The other options are real,
 * storable preferences — honestly marked unavailable rather than silently pretending to work.
 */
export const ASSISTANT_LANGUAGES: AssistantLanguage[] = [
  { code: "en", label: "English", available: true },
  { code: "uz", label: "Oʻzbek", available: false },
  { code: "es", label: "Español", available: false },
  { code: "fr", label: "Français", available: false },
  { code: "ar", label: "العربية", available: false },
  { code: "zh", label: "中文", available: false },
];

export type NotificationPreferences = {
  evidenceUpdates: boolean;
  missionActivity: boolean;
  weeklySummary: boolean;
};

export type AccessibilitySettings = {
  reducedMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
};

export const DEFAULT_OPERATOR_NAME = "CBAI Operator";

export type AssistantProfile = {
  /** The person's own name — used for the greeting ("Good morning, Botir"). */
  name: string;
  /** The Operator's chosen name — e.g. "Ava." Falls back to DEFAULT_OPERATOR_NAME when empty. */
  operatorName: string;
  avatar: AssistantAvatarId;
  voiceInputEnabled: boolean;
  preferredLanguage: string;
  translationLanguage: string;
  speechLanguage: string;
  workspaceRole: WorkspaceRole;
  timezone: string;
  country: string;
  organization: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilitySettings;
};

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function createEmptyAssistantProfile(): AssistantProfile {
  return {
    name: "",
    operatorName: "",
    avatar: "cyan",
    voiceInputEnabled: false,
    preferredLanguage: "en",
    translationLanguage: "en",
    speechLanguage: "en-US",
    workspaceRole: "citizen",
    timezone: browserTimezone(),
    country: "",
    organization: "",
    notifications: {
      evidenceUpdates: false,
      missionActivity: false,
      weeklySummary: false,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largerText: false,
    },
  };
}

/** A profile is "set up" once it has a real name — never inferred or fabricated. */
export function isAssistantProfileActive(profile: AssistantProfile): boolean {
  return profile.name.trim().length > 0;
}

/** The Operator's display name — the user's chosen name, or the honest product default. */
export function resolveOperatorName(profile: AssistantProfile): string {
  return profile.operatorName.trim() || DEFAULT_OPERATOR_NAME;
}
