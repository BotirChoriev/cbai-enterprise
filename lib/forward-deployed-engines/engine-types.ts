/**
 * Forward-deployed engine types — not autonomous agents; plan-only with confirmation gates.
 */

import type { OntologyLocale, OntologyObjectId } from "@/lib/ontology/types";

export const ENGINE_SCHEMA_VERSION = 1 as const;

export type ForwardDeployedEngineId =
  | "research"
  | "evidence"
  | "country_intelligence"
  | "organization_intelligence"
  | "mission"
  | "governance_review"
  | "multilingual_meeting";

export type EngineLifecycleState =
  | "idle"
  | "understanding"
  | "planning"
  | "awaiting_confirmation"
  | "executing"
  | "blocked"
  | "needs_evidence"
  | "needs_human_review"
  | "completed"
  | "failed"
  | "cancelled";

export type EngineInputField = {
  readonly key: string;
  readonly labelKey: string;
  readonly required: boolean;
  readonly provided: boolean;
  readonly inferred: boolean;
  readonly value?: string;
};

export type EngineProposedTask = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly kind: "task" | "review" | "evidence_request" | "research_question";
  readonly dependsOn?: readonly string[];
};

export type EngineRisk = {
  readonly id: string;
  readonly severity: "low" | "medium" | "high";
  readonly description: string;
  readonly mitigation?: string;
};

export type EngineLimitation = {
  readonly id: string;
  readonly description: string;
};

export type EngineAuditEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly state: EngineLifecycleState;
  readonly message: string;
  readonly actorId?: string;
};

export type EngineObjective = {
  readonly statement: string;
  readonly locale: OntologyLocale;
  readonly domain?: string;
};

export type EngineContext = {
  readonly pathname: string;
  readonly locale: OntologyLocale;
  readonly entityId?: string;
  readonly entityKind?: string;
  readonly entityName?: string;
  readonly projectId?: string;
  readonly missionId?: string;
  readonly countryCode?: string;
  readonly topicId?: string;
};

export type EnginePlan = {
  readonly clarifiedObjective: string;
  readonly hypotheses?: readonly string[];
  readonly proposedTasks: readonly EngineProposedTask[];
  readonly evidenceRequirements: readonly string[];
  readonly missingInputs: readonly EngineInputField[];
  readonly inferredFields: readonly string[];
  readonly userProvidedFields: readonly string[];
  readonly risks: readonly EngineRisk[];
  readonly limitations: readonly EngineLimitation[];
  readonly reportOutline?: readonly string[];
  readonly nextSafeAction: string;
  readonly mutationRequired: boolean;
};

export type EngineRunRecord = {
  readonly id: string;
  readonly engineId: ForwardDeployedEngineId;
  readonly engineVersion: string;
  readonly schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  readonly state: EngineLifecycleState;
  readonly objective: EngineObjective;
  readonly context: EngineContext;
  readonly plan?: EnginePlan;
  readonly ontologyObjectIds: readonly OntologyObjectId[];
  readonly auditTrail: readonly EngineAuditEntry[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly confirmedAt?: string;
  readonly completedAt?: string;
};

export type EngineRunDraft = {
  engineId: ForwardDeployedEngineId;
  objective: EngineObjective;
  context: EngineContext;
};

export type EngineResult = {
  readonly run: EngineRunRecord;
  readonly plan: EnginePlan;
  readonly readOnly: boolean;
  readonly confirmationRequired: boolean;
};
