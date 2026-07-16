import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";

export type MissionLifecycleNextKey = keyof TranslationDictionary["missionLifecycle"];

export function translateMissionLifecycleNext(
  translate: (path: string) => string,
  key: MissionLifecycleNextKey | undefined,
  fallback: string,
): string {
  if (!key) return fallback;
  return translate(`missionLifecycle.${key}`);
}
