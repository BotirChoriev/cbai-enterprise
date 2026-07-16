import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";
import type { CompassDirectionId } from "@/lib/assistant/intelligence-compass";
import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";

export type CompassCopyKey = keyof TranslationDictionary["compass"];

const ROLE_TO_COMPASS_COPY: Partial<Record<WorkspaceRole, CompassCopyKey>> = {
  student: "academic",
  researcher: "academic",
  professor: "academic",
  academic: "academic",
  university: "academic",
  research_center: "academic",
  engineer: "engineer",
  investor: "investor",
  company: "investor",
  economist: "investor",
  government: "government",
  administrator: "government",
};

export function resolveCompassCopyKey(role: WorkspaceRole): CompassCopyKey {
  return ROLE_TO_COMPASS_COPY[role] ?? "default";
}

export function translateCompassDirection(
  dictionary: TranslationDictionary,
  role: WorkspaceRole,
  directionId: CompassDirectionId,
): { label: string; description: string } {
  const copyKey = resolveCompassCopyKey(role);
  return dictionary.compass[copyKey][directionId];
}
