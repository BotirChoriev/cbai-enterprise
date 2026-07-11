/**
 * Deterministic "one primary next step" resolver (Release 5, Phase 4). Pure function over real
 * state only — no model call, no fabricated recommendation. Priority, in order:
 *
 *   1. Continue existing local work (a recently viewed real entity), when one exists.
 *   2. Open the user's selected workspace (their real role's default landing route).
 *   3. Complete Personal Operator setup, when no profile is active yet.
 *
 * "Review available evidence" and "explore a relevant catalog" (the mission's tiers 3–4) are
 * real, but every real workspace role always resolves to a real destination — so those two never
 * have a genuinely empty case to fill. They are offered instead as real, always-present secondary
 * actions (see HomeAssistantGreeting), rather than an unreachable third primary-tier branch.
 */

import type { ContextEntityRef } from "@/lib/context";
import {
  ROLE_DEFAULT_WORKSPACE,
  WORKSPACE_ROLE_LABELS,
  isAssistantProfileActive,
  type AssistantProfile,
} from "@/lib/assistant/assistant-profile";

export type NextStepAction = {
  id: "continue-work" | "open-workspace" | "complete-setup";
  label: string;
  href: string;
};

function entityHref(entity: ContextEntityRef): string {
  const base = entity.kind === "country" ? "/countries" : entity.kind === "company" ? "/companies" : "/universities";
  return `${base}?${new URLSearchParams({ [entity.kind]: entity.id }).toString()}`;
}

export function resolveNextStep(
  profile: AssistantProfile,
  mostRecentEntity: ContextEntityRef | null,
): NextStepAction {
  if (!isAssistantProfileActive(profile)) {
    return { id: "complete-setup", label: "Complete Personal Operator setup", href: "/settings" };
  }

  if (mostRecentEntity) {
    return {
      id: "continue-work",
      label: `Continue viewing ${mostRecentEntity.name}`,
      href: entityHref(mostRecentEntity),
    };
  }

  return {
    id: "open-workspace",
    label: `Open your ${WORKSPACE_ROLE_LABELS[profile.workspaceRole]} workspace`,
    href: ROLE_DEFAULT_WORKSPACE[profile.workspaceRole],
  };
}
