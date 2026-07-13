/**
 * Deterministic "one primary next step" resolver (Release 5, Phase 4; extended in the Platform
 * Activation mission to remember the real most-recently-updated project). Pure function over real
 * state only — no model call, no fabricated recommendation. Priority, in order:
 *
 *   1. Continue a real, in-progress project — the same real "next best action" the Intelligence
 *      Guide already computes per-project (lib/project/project-guide.ts), reused here rather than
 *      a second suggestion engine. Only offered while a real guided milestone is still open; a
 *      project whose guide already reports "ready" falls through to the next tier so this card
 *      never repeats a suggestion the user has nothing left to act on.
 *   2. Continue existing local work (a recently viewed real entity), when one exists.
 *   3. Open the user's selected workspace (their real role's default landing route).
 *   4. Complete Personal Operator setup, when no profile is active yet.
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
import { loadProjects } from "@/lib/project/project-store";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";

export type NextStepAction = {
  id: "continue-project" | "continue-work" | "open-workspace" | "complete-setup";
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

  const latestProject = loadProjects()[0];
  if (latestProject) {
    const step = resolveProjectGuideStep(latestProject);
    if (step.id !== "ready") {
      return {
        id: "continue-project",
        label: `${latestProject.title}: ${step.suggestion}`,
        href: step.href,
      };
    }
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
