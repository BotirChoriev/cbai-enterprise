"use client";

import { useSyncExternalStore } from "react";
import { cbaiLoadingLine, cbaiMineralPanel, cbaiTransition } from "@/components/brand/brand-classes";
import { canonicalizeUiLocale, type CanonicalUiLocale } from "@/lib/i18n/canonicalize-locale";
import { getDictionary } from "@/lib/i18n/translate";
import { resolveStorageKey } from "@/lib/storage/namespaced-key";

type LoadingMessageKey =
  | "loadingMission"
  | "loadingResearch"
  | "loadingReport"
  | "loadingGraph"
  | "loadingSearch";

type RouteChromeFallbackProps = {
  messageKey?: LoadingMessageKey;
};

const PROFILE_BASE_KEY = "cbai-assistant-profile";

/**
 * Read the same namespaced profile key the live AssistantProfileProvider uses.
 * Reading the bare legacy key here previously caused EN/RU chrome flashes under UZ
 * during Suspense route transitions when `:local` held UZ but the bare key held RU/EN.
 */
function readPreferredLanguage(): CanonicalUiLocale {
  try {
    const key = resolveStorageKey(PROFILE_BASE_KEY);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Idempotent legacy migration path — only if namespaced bucket is empty.
      const legacy = localStorage.getItem(PROFILE_BASE_KEY);
      if (!legacy) return "en";
      const parsedLegacy = JSON.parse(legacy) as { preferredLanguage?: string };
      return canonicalizeUiLocale(parsedLegacy?.preferredLanguage);
    }
    const parsed = JSON.parse(raw) as { preferredLanguage?: string };
    return canonicalizeUiLocale(parsed?.preferredLanguage);
  } catch {
    return "en";
  }
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (!event.key) return;
    try {
      const activeKey = resolveStorageKey(PROFILE_BASE_KEY);
      if (event.key === activeKey) onStoreChange();
    } catch {
      // ignore storage errors during sync
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

/** Meaningful Suspense fallback — reads saved language without provider tree. */
export default function RouteChromeFallback({ messageKey = "loadingMission" }: RouteChromeFallbackProps) {
  const language = useSyncExternalStore(subscribe, readPreferredLanguage, () => "en" as const);
  const message = getDictionary(language).common[messageKey];

  return (
    <p
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${cbaiMineralPanel} ${cbaiLoadingLine} ${cbaiTransition} mx-4 my-4 lg:mx-5`}
    >
      {message}
    </p>
  );
}
