/**
 * Canonical action contract adapter — indexes platform-actions for UI + Voice.
 * Not a third execution engine: handlers remain in resolve/apply platform-actions.
 */

import type { PlatformActionId, PlatformMutationKind } from "@/lib/platform-actions/types";
import { getPlatformActionDefinition } from "@/lib/platform-actions/registry";
import {
  VOICE_CAPABILITY_REGISTRY,
  type VoiceCapabilityEntry,
} from "@/lib/voice-operator/capability-registry";

export type CanonicalActionFailureClass =
  | "validation"
  | "not_found"
  | "ambiguous"
  | "confirmation_required"
  | "unsupported"
  | "permission"
  | "broker"
  | "generic";

export type CanonicalActionContract = {
  readonly id: PlatformActionId | string;
  readonly labelKey: string;
  readonly supportedRoutes: readonly string[];
  readonly requiredContext: readonly string[];
  readonly requiredFields: readonly string[];
  readonly confirmationRequired: boolean;
  readonly mutationKind: PlatformMutationKind | "none";
  readonly successKey: string;
  readonly failureKey: string;
  readonly failureClass: CanonicalActionFailureClass;
  readonly accessibilityLabelKey: string;
  readonly analyticsEvent: string | null;
  readonly platformActionId: PlatformActionId | null;
};

function failureClassFor(entry: VoiceCapabilityEntry): CanonicalActionFailureClass {
  if (entry.kind === "unsupported_honest") return "unsupported";
  if (entry.needsConfirmation) return "confirmation_required";
  if (entry.kind === "draft_create" || entry.kind === "mutate_confirm") return "validation";
  return "generic";
}

/** Build the shared contract view from platform-actions + voice capability index. */
export function listCanonicalActionContracts(): readonly CanonicalActionContract[] {
  return VOICE_CAPABILITY_REGISTRY.map((entry) => {
    const def = entry.actionId ? getPlatformActionDefinition(entry.actionId) : null;
    return {
      id: entry.id,
      labelKey: entry.successKey,
      supportedRoutes: entry.routes,
      requiredContext: entry.routes.filter((r) => r !== "*"),
      requiredFields: entry.needsConfirmation ? ["title", "objective", "nextAction", "humanDecision"] : [],
      confirmationRequired: entry.needsConfirmation,
      mutationKind: def?.mutationKind ?? "none",
      successKey: entry.successKey,
      failureKey: entry.failureKey,
      failureClass: failureClassFor(entry),
      accessibilityLabelKey: entry.successKey,
      analyticsEvent: def?.analyticsClass ?? null,
      platformActionId: entry.actionId,
    };
  });
}

export function getCanonicalActionContract(id: string): CanonicalActionContract | null {
  return listCanonicalActionContracts().find((c) => c.id === id || c.platformActionId === id) ?? null;
}

export function canonicalActionsForRoute(pathname: string): readonly CanonicalActionContract[] {
  const path = pathname.split("?")[0] || "/";
  return listCanonicalActionContracts().filter(
    (c) => c.supportedRoutes.includes("*") || c.supportedRoutes.some((r) => path === r || path.startsWith(`${r}/`)),
  );
}
