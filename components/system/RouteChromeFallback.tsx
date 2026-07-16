"use client";

import { useSyncExternalStore } from "react";
import { cbaiLoadingLine, cbaiMineralPanel, cbaiTransition } from "@/components/brand/brand-classes";
import { getDictionary } from "@/lib/i18n/translate";

type LoadingMessageKey =
  | "loadingMission"
  | "loadingResearch"
  | "loadingReport"
  | "loadingGraph"
  | "loadingSearch";

type SupportedLanguage = "en" | "ru" | "uz" | "tr";

type RouteChromeFallbackProps = {
  messageKey?: LoadingMessageKey;
};

function readPreferredLanguage(): SupportedLanguage {
  try {
    const raw = localStorage.getItem("cbai-assistant-profile");
    if (!raw) return "en";
    const parsed = JSON.parse(raw) as { preferredLanguage?: string };
    const lang = parsed?.preferredLanguage;
    if (lang === "ru" || lang === "uz" || lang === "tr" || lang === "en") return lang;
  } catch {
    /* ignore malformed profile */
  }
  return "en";
}

function subscribe() {
  return () => {};
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
