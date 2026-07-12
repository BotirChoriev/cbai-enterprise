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

  // Real HTML lang sync (Global Language Foundation mission) — server/static markup always ships
  // lang="en" (there is no per-request locale to render server-side in a static export); this
  // reflects the real client-side preference once it's known, exactly like the accessibility
  // classes above, and never causes a hydration mismatch since it runs after hydration completes.
  useEffect(() => {
    document.documentElement.lang = profile.preferredLanguage || "en";
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
