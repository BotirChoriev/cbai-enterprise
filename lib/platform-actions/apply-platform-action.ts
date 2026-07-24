/** Client-side platform action application — navigation and composer only after validation. */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { OperationalObjectDraft } from "@/lib/operational-objects/operational-object.types";
import type { PlatformActionResult, PlatformGuidance } from "@/lib/platform-actions/types";
import { invokeEngineStart } from "@/lib/forward-deployed-engines/engine-bridge";
import type { OntologyLocale } from "@/lib/ontology/types";
import { validateNavigationHref } from "@/lib/platform-actions/action-registry";

export type ApplyPlatformActionDeps = {
  readonly router: AppRouterInstance;
  readonly pathname?: string;
  readonly locale?: OntologyLocale;
  readonly openComposer: (draft: OperationalObjectDraft, inferredFields: readonly string[], source: "voice_command" | "typed_command") => void;
  readonly onLocalControl?: (
    control: "voice.stop" | "voice.close" | "transcript.show" | "transcript.hide" | "navigate.back",
  ) => void;
  readonly setGuidance?: (guidance: PlatformGuidance | null) => void;
  readonly setTranscriptVisible?: (visible: boolean) => void;
  readonly t: (path: string, vars?: Record<string, string>) => string;
};

export type ApplyPlatformActionOutcome = {
  readonly handled: boolean;
  readonly message: string | null;
  readonly awaitingConfirmation: boolean;
  readonly navigatedHref?: string;
};

function pushIfAllowed(router: AppRouterInstance, href: string | undefined): string | undefined {
  if (!href || !validateNavigationHref(href)) return undefined;
  router.push(href);
  return href;
}

export function applyPlatformActionResult(
  result: PlatformActionResult,
  deps: ApplyPlatformActionDeps,
): ApplyPlatformActionOutcome {
  if (!result.ok) {
    if (result.code === "ambiguous_intent") {
      return { handled: true, message: deps.t(result.messageKey), awaitingConfirmation: false };
    }
    return { handled: true, message: deps.t(result.messageKey), awaitingConfirmation: false };
  }

  if (result.localControl) {
    deps.onLocalControl?.(result.localControl);
    return {
      handled: true,
      message: result.messageKey ? deps.t(result.messageKey, result.messageVars) : null,
      awaitingConfirmation: false,
    };
  }

  const navHref = result.navigation?.href;

  if (result.engineStart) {
    const navigatedHref = pushIfAllowed(deps.router, navHref);
    invokeEngineStart({
      engineId: result.engineStart.engineId as import("@/lib/forward-deployed-engines/engine-types").ForwardDeployedEngineId,
      statement: result.engineStart.statement,
      pathname: deps.pathname ?? navigatedHref ?? "/",
      locale: deps.locale ?? "en",
      entityId: result.engineStart.entityId,
      entityName: result.engineStart.entityName,
      countryCode: result.engineStart.countryCode,
      domain: result.engineStart.domain,
    });
    deps.setGuidance?.(result.guidance ?? null);
    return {
      handled: true,
      message: result.messageKey ? deps.t(result.messageKey, result.messageVars) : null,
      awaitingConfirmation: true,
      navigatedHref,
    };
  }

  if (result.mutation) {
    const navigatedHref = pushIfAllowed(deps.router, navHref);
    deps.openComposer(result.mutation.draft, result.mutation.inferredFields, "voice_command");
    deps.setGuidance?.(result.guidance ?? null);
    return {
      handled: true,
      message: result.messageKey ? deps.t(result.messageKey, result.messageVars) : null,
      awaitingConfirmation: true,
      navigatedHref,
    };
  }

  if (navHref) {
    const navigatedHref = pushIfAllowed(deps.router, navHref);
    deps.setGuidance?.(result.guidance ?? null);
    return {
      handled: Boolean(navigatedHref),
      message: result.messageKey ? deps.t(result.messageKey, result.messageVars) : null,
      awaitingConfirmation: false,
      navigatedHref,
    };
  }

  return { handled: false, message: null, awaitingConfirmation: false };
}
