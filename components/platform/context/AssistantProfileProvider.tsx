"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createEmptyAssistantProfile,
  isAssistantProfileActive,
  type AssistantProfile,
} from "@/lib/assistant/assistant-profile";
import {
  clearAssistantProfile,
  loadAssistantProfile,
  saveAssistantProfile,
} from "@/lib/assistant/assistant-storage";
import { isRtlLanguage } from "@/lib/i18n/languages";

type AssistantProfileValue = {
  profile: AssistantProfile;
  isActive: boolean;
  updateProfile: (patch: Partial<AssistantProfile>) => void;
  resetProfile: () => void;
};

const AssistantProfileContext = createContext<AssistantProfileValue | null>(null);

// One real external store (this browser's localStorage), read through useSyncExternalStore so
// the server snapshot (always empty — no profile exists during static generation) and the
// client's real saved profile reconcile safely, without a setState-in-effect render cascade.
const listeners = new Set<() => void>();
let cachedSnapshot: AssistantProfile | null = null;

function getSnapshot(): AssistantProfile {
  if (cachedSnapshot === null) {
    cachedSnapshot = loadAssistantProfile();
  }
  return cachedSnapshot;
}

function getServerSnapshot(): AssistantProfile {
  return createEmptyAssistantProfile();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commitProfile(next: AssistantProfile): void {
  saveAssistantProfile(next);
  cachedSnapshot = next;
  listeners.forEach((listener) => listener());
}

export function AssistantProfileProvider({ children }: { children: ReactNode }) {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cbai-reduced-motion", profile.accessibility.reducedMotion);
    root.classList.toggle("cbai-high-contrast", profile.accessibility.highContrast);
    root.classList.toggle("cbai-larger-text", profile.accessibility.largerText);
  }, [profile.accessibility]);

  // Real Light/Deep Intelligence Mode (Platform Activation mission) — "system" genuinely follows
  // the OS/browser's own prefers-color-scheme via a live matchMedia listener, re-applied whenever
  // the OS preference changes while the tab is open; "light"/"dark" are an explicit, saved
  // override. Never defaults to assuming dark without checking.
  useEffect(() => {
    const root = document.documentElement;

    if (profile.themeMode === "light") {
      root.classList.add("theme-light");
      return;
    }
    if (profile.themeMode === "dark") {
      root.classList.remove("theme-light");
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const applySystemTheme = () => root.classList.toggle("theme-light", media.matches);
    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, [profile.themeMode]);

  // Real HTML lang/dir sync (Global Language Foundation mission) — server/static markup always
  // ships lang="en" (there is no per-request locale to render server-side in a static export);
  // this reflects the real client-side preference once it's known, exactly like the accessibility
  // classes above, and never causes a hydration mismatch since it runs after hydration completes.
  // `dir` is real RTL preparation (Phase 18) — no active language is RTL today, but activating one
  // later needs no new plumbing.
  useEffect(() => {
    document.documentElement.lang = profile.preferredLanguage || "en";
    document.documentElement.dir = isRtlLanguage(profile.preferredLanguage) ? "rtl" : "ltr";
  }, [profile.preferredLanguage]);

  const updateProfile = useCallback((patch: Partial<AssistantProfile>) => {
    const current = getSnapshot();
    const next: AssistantProfile = {
      ...current,
      ...patch,
      notifications: { ...current.notifications, ...patch.notifications },
      accessibility: { ...current.accessibility, ...patch.accessibility },
    };
    commitProfile(next);
  }, []);

  const resetProfile = useCallback(() => {
    clearAssistantProfile();
    commitProfile(createEmptyAssistantProfile());
  }, []);

  const value = useMemo<AssistantProfileValue>(
    () => ({
      profile,
      isActive: isAssistantProfileActive(profile),
      updateProfile,
      resetProfile,
    }),
    [profile, updateProfile, resetProfile],
  );

  return (
    <AssistantProfileContext.Provider value={value}>{children}</AssistantProfileContext.Provider>
  );
}

export function useAssistantProfile(): AssistantProfileValue {
  const value = useContext(AssistantProfileContext);
  if (!value) {
    throw new Error("useAssistantProfile must be used within AssistantProfileProvider");
  }
  return value;
}
