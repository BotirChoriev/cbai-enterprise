import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type { EvidencePulseLimitationKey } from "@/lib/intelligence-os/evidence-pulse";

const LIMITATION_KEY_MAP: Record<
  EvidencePulseLimitationKey,
  keyof TranslationDictionary["evidencePulse"]
> = {
  noProject: "limitationNoProject",
  noRefs: "limitationNoRefs",
  conflicting: "limitationConflicting",
  outdated: "limitationOutdated",
  unverified: "limitationUnverified",
  deviceLocal: "limitationDeviceLocal",
};

export function translateEvidencePulseLimitation(
  dictionary: TranslationDictionary,
  limitationKey: EvidencePulseLimitationKey,
): string {
  const key = LIMITATION_KEY_MAP[limitationKey];
  return dictionary.evidencePulse[key] ?? dictionary.evidencePulse.limitationDeviceLocal;
}
