import type { WorkspaceRole } from "@/lib/assistant/assistant-profile";

export type CompassDirectionId = "discover" | "research" | "evidence" | "analyze" | "organize" | "report";

export type CompassDirection = {
  id: CompassDirectionId;
  label: string;
  description: string;
  href: string;
};

export const COMPASS_DIRECTION_HREFS: Record<CompassDirectionId, string> = {
  discover: "/search",
  research: "/research",
  evidence: "/knowledge",
  analyze: "/research/workspace",
  organize: "/my-work",
  report: "/reports",
};

export const COMPASS_DIRECTION_ORDER: readonly CompassDirectionId[] = [
  "discover",
  "research",
  "evidence",
  "analyze",
  "organize",
  "report",
];

/** @deprecated Use translateCompassDirection from lib/i18n/compass-translation.ts */
export function resolveCompassDirections(role: WorkspaceRole): readonly CompassDirection[] {
  void role;
  return COMPASS_DIRECTION_ORDER.map((id) => ({
    id,
    label: id,
    description: "",
    href: COMPASS_DIRECTION_HREFS[id],
  }));
}
