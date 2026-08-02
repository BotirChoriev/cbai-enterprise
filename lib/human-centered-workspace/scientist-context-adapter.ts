import type {
  ContextAttribute,
  ContextValue,
  HumanContext,
  MissingContextItem,
} from "@/lib/human-centered-workspace/contracts";
import type { HumanContextRepository } from "@/lib/human-centered-workspace/context-repository";
import { deviceLocalHumanContextRepository } from "@/lib/human-centered-workspace/device-local-context-repository";

export const SCIENTIST_HUMAN_CONTEXT_ID = "workspace:scientist-research:active";

export type ScientistContextInput = {
  readonly universityId: string | null;
  readonly universityName: string | null;
  readonly unitId: string | null;
  readonly unitSymbol: string | null;
  readonly projectStatement: string | null;
  readonly smartIdeaId: string | null;
};

const SCIENTIST_CONTEXT_KEYS: readonly (keyof ScientistContextInput)[] = [
  "universityId",
  "universityName",
  "unitId",
  "unitSymbol",
  "projectStatement",
  "smartIdeaId",
];

function now(): string {
  return new Date().toISOString();
}

function value<T>(input: T | null): ContextValue<T> {
  return {
    value: input,
    state: input === null ? "unknown" : "known",
    source: { kind: "human" },
    observedAt: now(),
  };
}

function attribute(key: string, input: unknown): ContextAttribute {
  return {
    key,
    schema: { schemaId: `scientist.${key}`, version: 1 },
    value: value(input),
    sensitivity: "internal",
  };
}

function missing(input: ScientistContextInput): MissingContextItem[] {
  const items: MissingContextItem[] = [];
  if (!input.universityId) {
    items.push({
      id: "university",
      label: "University",
      reason: "The institution has not been provided and will not be guessed.",
      requiredFor: ["institutional linkage"],
    });
  }
  if (!input.unitId) {
    items.push({
      id: "measurement-unit",
      label: "Measurement unit",
      reason: "A unit is required before a measurement can be interpreted.",
      requiredFor: ["measurement capture", "comparison"],
    });
  }
  if (!input.smartIdeaId) {
    items.push({
      id: "research-project",
      label: "Research project",
      reason: "Measurements must belong to a confirmed research project.",
      requiredFor: ["measurement persistence"],
    });
  }
  return items;
}

function attributeValue<T>(context: HumanContext, key: string): T | null {
  const found = context.attributes.find((item) => item.key === key);
  return (found?.value.value as T | null | undefined) ?? null;
}

export function scientistInputFromHumanContext(context: HumanContext): ScientistContextInput {
  return {
    universityId: attributeValue<string>(context, "universityId"),
    universityName: attributeValue<string>(context, "universityName"),
    unitId: attributeValue<string>(context, "unitId"),
    unitSymbol: attributeValue<string>(context, "unitSymbol"),
    projectStatement: context.currentOutcome.value,
    smartIdeaId: attributeValue<string>(context, "smartIdeaId"),
  };
}

export function readScientistHumanContext(
  repository: HumanContextRepository = deviceLocalHumanContextRepository,
): HumanContext | null {
  return repository.read(SCIENTIST_HUMAN_CONTEXT_ID);
}

export function buildScientistHumanContext(
  input: ScientistContextInput,
  previous: HumanContext | null = null,
): HumanContext {
  const version = (previous?.version ?? 0) + 1;
  const recordedAt = now();
  const attributes = [
    attribute("universityId", input.universityId),
    attribute("universityName", input.universityName),
    attribute("unitId", input.unitId),
    attribute("unitSymbol", input.unitSymbol),
    attribute("smartIdeaId", input.smartIdeaId),
  ];
  const context: HumanContext = {
    contextId: SCIENTIST_HUMAN_CONTEXT_ID,
    version,
    scope: { kind: "workspace", workspaceId: "scientist-research-active" },
    selfDescription: {
      value: "scientist",
      state: "inferred",
      source: { kind: "system", ref: "scientist-workflow-intent" },
      observedAt: recordedAt,
    },
    languages: previous?.languages ?? value<readonly string[]>(null),
    currentOutcome: value(input.projectStatement),
    resources: value<readonly []>([]),
    constraints: value<readonly []>([]),
    stakeholders: value<readonly []>([]),
    authorityPolicy: {
      finalDecisionRemainsHuman: true,
      boundaries: [
        { actionLevel: 0, requiresHumanConfirmation: false },
        { actionLevel: 1, requiresHumanConfirmation: false },
        { actionLevel: 2, requiresHumanConfirmation: true },
        { actionLevel: 3, requiresHumanConfirmation: true },
      ],
    },
    consentGrants: previous?.consentGrants ?? [],
    openQuestions: missing(input),
    attributes,
  };

  return context;
}

export function writeScientistHumanContext(
  input: ScientistContextInput,
  repository: HumanContextRepository = deviceLocalHumanContextRepository,
): HumanContext {
  const previous = repository.read(SCIENTIST_HUMAN_CONTEXT_ID);
  if (previous) {
    const currentInput = scientistInputFromHumanContext(previous);
    const unchanged = SCIENTIST_CONTEXT_KEYS.every(
      (key) => currentInput[key] === input[key],
    );
    if (unchanged) return previous;
  }
  const context = buildScientistHumanContext(input, previous);
  const recordedAt = context.currentOutcome.observedAt;
  const attributes = context.attributes;
  const version = context.version;

  repository.write(context, {
    eventId: `context-event-${version}-${Date.now().toString(36)}`,
    eventType: previous ? "context.assertion_corrected" : "context.observation_recorded",
    schemaVersion: 1,
    aggregateId: context.contextId,
    aggregateVersion: context.version,
    actor: { actorId: "current-human", actorKind: "human" },
    occurredAt: recordedAt,
    correlationId: `scientist-context-${version}`,
    idempotencyKey: `${context.contextId}:${version}`,
    payload: {
      contextId: context.contextId,
      contextVersion: context.version,
      changedKeys: ["currentOutcome", ...attributes.map((item) => item.key)],
    },
  });
  return context;
}
