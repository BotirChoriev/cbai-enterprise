import type {
  AvailableCommand,
  CapabilityManifest,
  HumanContext,
  WorkspaceManifest,
  WorkspaceModuleInstance,
} from "@/lib/human-centered-workspace/contracts";

function contextKnown(context: HumanContext, key: string): boolean {
  if (key === "currentOutcome") {
    return context.currentOutcome.state === "known" && Boolean(context.currentOutcome.value);
  }
  const attribute = context.attributes.find((item) => item.key === key);
  return attribute?.value.state === "known" && attribute.value.value !== null;
}

function capabilityState(context: HumanContext, capability: CapabilityManifest): WorkspaceModuleInstance["state"] {
  return capability.requiredContext.every((requirement) => contextKnown(context, requirement.key))
    ? "active"
    : "blocked";
}

/**
 * Deterministic reference composer. It selects registered capabilities supplied
 * by the caller and never classifies the human into a persona. A future AI
 * proposer may recommend candidates, but this validation remains authoritative.
 */
export function composeWorkspace(
  context: HumanContext,
  capabilities: readonly CapabilityManifest[],
  input: { readonly workspaceId: string; readonly title: string },
): WorkspaceManifest {
  const modules = capabilities.map<WorkspaceModuleInstance>((capability) => ({
    moduleId: `${input.workspaceId}:${capability.capabilityId}`,
    capabilityId: capability.capabilityId,
    capabilityVersion: capability.version,
    state: capabilityState(context, capability),
    blockRefs: capability.uiBlocks,
  }));

  const commandMap = new Map<string, AvailableCommand>();
  for (const capability of capabilities) {
    const enabled = capabilityState(context, capability) === "active";
    for (const actionId of capability.actions) {
      const current = commandMap.get(actionId);
      commandMap.set(actionId, {
        actionId,
        enabled: Boolean(current?.enabled || enabled),
        blockedReason: current?.enabled || enabled ? undefined : "Required context is still missing.",
      });
    }
  }

  return {
    workspaceId: input.workspaceId,
    version: 1,
    contextId: context.contextId,
    contextVersion: context.version,
    title: input.title,
    objective: context.currentOutcome.value ?? "Objective not yet provided",
    modules,
    layout: {
      primaryModuleId: modules.find((module) => module.state === "active")?.moduleId,
      orderedModuleIds: modules.map((module) => module.moduleId),
    },
    commands: [...commandMap.values()],
    missingItems: context.openQuestions,
    requiredConfirmations: [],
    compositionReasons: capabilities.map((capability) => ({
      capabilityId: capability.capabilityId,
      statement: capability.purpose,
      contextKeys: [
        ...capability.requiredContext.map((requirement) => requirement.key),
        ...capability.optionalContext.map((requirement) => requirement.key),
      ],
    })),
  };
}

