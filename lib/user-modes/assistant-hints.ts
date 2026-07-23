/**
 * Optional Digital Assistant suggestion hints derived from the selected user mode.
 * Stub-level: navigation prompts only — never invents evidence or live facts.
 */

import { getUserModeCatalogEntry } from "@/lib/user-modes/catalog";
import { loadSelectedUserModeId } from "@/lib/user-modes/mode-store";
import type { UserModeId } from "@/lib/user-modes/types";

export type UserModeSuggestionHint = {
  readonly id: string;
  readonly prompt: string;
  readonly actionLabel: string;
  readonly href: string;
  readonly modeId: UserModeId;
};

export function buildUserModeSuggestionHints(
  modeId: UserModeId = loadSelectedUserModeId(),
): readonly UserModeSuggestionHint[] {
  const entry = getUserModeCatalogEntry(modeId);
  return [
    {
      id: `mode-open-dashboard-${entry.id}`,
      prompt: `Your mode is “${entry.label}”. Open the suggested starting surface?`,
      actionLabel: `Open ${entry.label} start`,
      href: entry.defaultDashboardHref,
      modeId: entry.id,
    },
    {
      id: `mode-review-modes-${entry.id}`,
      prompt:
        "User mode is a personal preference only — it does not change organization permissions.",
      actionLabel: "Review modes",
      href: "/modes",
      modeId: entry.id,
    },
  ];
}
