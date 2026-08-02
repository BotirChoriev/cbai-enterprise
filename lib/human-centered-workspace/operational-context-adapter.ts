import type {
  ContextAttribute,
  ContextValue,
  HumanContext,
  MissingContextItem,
} from "@/lib/human-centered-workspace/contracts";

export type OperationalContextInput = {
  readonly contextId: string;
  readonly workspaceId: string;
  readonly outcome: string;
  readonly knownFacts: readonly string[];
  readonly missingInformation: readonly string[];
  readonly successCriteria?: string | null;
  readonly decisionOwner?: string | null;
  readonly sourceMaterial?: readonly string[] | null;
  readonly team?: readonly string[] | null;
};

function value<T>(input: T | null, observedAt: string): ContextValue<T> {
  return {
    value: input,
    state: input === null ? "unknown" : "known",
    source: { kind: "human" },
    observedAt,
  };
}

function attribute(key: string, input: unknown, observedAt: string): ContextAttribute {
  return {
    key,
    schema: { schemaId: `operations.${key}`, version: 1 },
    value: value(input, observedAt),
    sensitivity: "internal",
  };
}

export function buildOperationalHumanContext(input: OperationalContextInput): HumanContext {
  const observedAt = new Date().toISOString();
  const missingItems: MissingContextItem[] = input.missingInformation.map((label, index) => ({
    id: `operational-missing-${index}`,
    label,
    reason: "This information was not provided and will not be guessed.",
    requiredFor: ["operational planning"],
  }));
  if (!input.successCriteria) {
    missingItems.push({
      id: "success-criteria",
      label: "Success criteria",
      reason: "Execution and monitoring require a verifiable target.",
      requiredFor: ["execution plan", "monitoring"],
    });
  }
  if (!input.decisionOwner) {
    missingItems.push({
      id: "decision-owner",
      label: "Human decision owner",
      reason: "Consequential actions require an accountable human owner.",
      requiredFor: ["execution approval"],
    });
  }

  return {
    contextId: input.contextId,
    version: 1,
    scope: { kind: "workspace", workspaceId: input.workspaceId },
    selfDescription: value<string>(null, observedAt),
    languages: value<readonly string[]>(null, observedAt),
    currentOutcome: value(input.outcome || null, observedAt),
    resources: value<readonly []>([], observedAt),
    constraints: value<readonly []>([], observedAt),
    stakeholders: value<readonly []>([], observedAt),
    authorityPolicy: {
      finalDecisionRemainsHuman: true,
      boundaries: [
        { actionLevel: 0, requiresHumanConfirmation: false },
        { actionLevel: 1, requiresHumanConfirmation: false },
        { actionLevel: 2, requiresHumanConfirmation: true },
        { actionLevel: 3, requiresHumanConfirmation: true },
      ],
    },
    consentGrants: [],
    openQuestions: missingItems,
    attributes: [
      attribute("knownFacts", input.knownFacts, observedAt),
      attribute("successCriteria", input.successCriteria ?? null, observedAt),
      attribute("decisionOwner", input.decisionOwner ?? null, observedAt),
      attribute("sourceMaterial", input.sourceMaterial ?? null, observedAt),
      attribute("team", input.team ?? null, observedAt),
    ],
  };
}

