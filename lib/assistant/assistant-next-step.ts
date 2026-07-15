/**
 * Deterministic "one primary next step" resolver (Release 5, Phase 4; extended in the Platform
 * Activation mission to remember the real most-recently-updated project; reordered in BUILD-009
 * to make continuity — not introduction — the default). Pure function over real state only — no
 * model call, no fabricated recommendation. Priority, in order:
 *
 *   1. Continue a real, in-progress project — the same real "next best action" the Intelligence
 *      Guide already computes per-project (lib/project/project-guide.ts), reused here rather than
 *      a second suggestion engine. Offered whenever a real project exists at all, even one whose
 *      guide reports "ready": that project is still real, ongoing work worth resuming, not nothing
 *      left to say. Checked before the profile-active check below on purpose — a visitor with 3
 *      real projects who never bothered typing a display name into Settings still has real work
 *      to resume; "please finish setting up your profile" is not the honest first thing to tell
 *      them.
 *   2. Continue existing local work (a recently viewed real entity), when one exists.
 *   3. Open the user's selected workspace (their real role's default landing route), once a
 *      profile is active.
 *   4. Complete Personal Operator setup — the one genuinely honest "arrival" case, reached only
 *      when there is truly no project, no recent entity, and no named profile yet.
 *
 * "Review available evidence" and "explore a relevant catalog" (the mission's tiers 3–4) are
 * real, but every real workspace role always resolves to a real destination — so those two never
 * have a genuinely empty case to fill. They are offered instead as real, always-present secondary
 * actions (see HomeAssistantGreeting), rather than an unreachable third primary-tier branch.
 */

import type { ContextEntityRef } from "@/lib/context";
import {
  ROLE_DEFAULT_WORKSPACE,
  isAssistantProfileActive,
  type AssistantProfile,
} from "@/lib/assistant/assistant-profile";
import { loadProjects } from "@/lib/project/project-store";
import type { Project } from "@/lib/project/project-types";
import { resolveProjectGuideStep } from "@/lib/project/project-guide";
import en from "@/lib/i18n/dictionaries/en";
import { translate, interpolate } from "@/lib/i18n/translate";

export type NextStepAction = {
  id: "continue-project" | "continue-work" | "open-workspace" | "complete-setup";
  label: string;
  href: string;
};

export type NextStepTranslator = (path: string, vars?: Record<string, string>) => string;

/** Default translator — the real English dictionary, so every existing caller that doesn't pass
 * a live `t()` (e.g. scripts/test-product-activation.ts) keeps getting the exact same English
 * strings this function always returned, unchanged. */
const defaultTranslate: NextStepTranslator = (path, vars) => {
  const raw = translate(en, path);
  return vars ? interpolate(raw, vars) : raw;
};

function entityHref(entity: ContextEntityRef): string {
  const base = entity.kind === "country" ? "/countries" : entity.kind === "company" ? "/companies" : "/universities";
  return `${base}?${new URLSearchParams({ [entity.kind]: entity.id }).toString()}`;
}

export function resolveNextStep(
  profile: AssistantProfile,
  mostRecentEntity: ContextEntityRef | null,
  t: NextStepTranslator = defaultTranslate,
  // Injectable rather than always read internally — a hydration-guarded caller (e.g.
  // HomeAssistantGreeting, which must render an identical first paint on server and client) needs
  // to control exactly when this touches localStorage-backed data. Callers that don't pass one
  // (every existing test, every other caller) get the exact same real lookup as before.
  latestProject: Project | null = loadProjects()[0] ?? null,
): NextStepAction {
  if (latestProject) {
    const step = resolveProjectGuideStep(latestProject, t);
    return {
      id: "continue-project",
      label: `${latestProject.title}: ${step.suggestion}`,
      href: step.href,
    };
  }

  if (mostRecentEntity) {
    return {
      id: "continue-work",
      label: t("assistant.nextStepContinueViewing", { name: mostRecentEntity.name }),
      href: entityHref(mostRecentEntity),
    };
  }

  if (!isAssistantProfileActive(profile)) {
    return { id: "complete-setup", label: t("assistant.nextStepCompleteSetup"), href: "/settings" };
  }

  return {
    id: "open-workspace",
    label: t("assistant.nextStepOpenWorkspace", { role: t(`workspaceRoles.${profile.workspaceRole}`) }),
    href: ROLE_DEFAULT_WORKSPACE[profile.workspaceRole],
  };
}
