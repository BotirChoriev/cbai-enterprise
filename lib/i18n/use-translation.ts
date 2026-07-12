"use client";

import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { getDictionary, translate, interpolate } from "@/lib/i18n/translate";

/**
 * The one real translation hook every component uses (Global Language Foundation mission). Reads
 * the interface language from the existing Assistant Profile (`preferredLanguage`) rather than a
 * second, parallel state system — the same profile that already persists signed-out locally and
 * signed-in via the cloud profile sync (lib/supabase/cloud-profile.ts), so language selection
 * inherits that persistence for free.
 */
export function useTranslation() {
  const { profile } = useAssistantProfile();
  const dictionary = getDictionary(profile.preferredLanguage);

  function t(path: string, vars?: Record<string, string>): string {
    const raw = translate(dictionary, path);
    return vars ? interpolate(raw, vars) : raw;
  }

  return { t, language: profile.preferredLanguage };
}
