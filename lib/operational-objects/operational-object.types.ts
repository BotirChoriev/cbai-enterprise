/**
 * Canonical Operational Object model — unified work index across CBAI domains.
 * Extends existing Project/Mission concepts without replacing them.
 */

export const OPERATIONAL_OBJECT_SCHEMA_VERSION = 1 as const;

export type OperationalObjectType =
  | "project"
  | "mission"
  | "work_plan"
  | "task"
  | "research_question"
  | "evidence_request"
  | "review"
  | "decision_brief"
  | "meeting_action"
  | "meeting"
  | "intelligence_room"
  | "source_review"
  | "country_watch"
  | "indicator_watch"
  | "pdf_review"
  | "report_draft"
  | "decision_review";

export type OperationalObjectStatus =
  | "draft"
  | "ready"
  | "active"
  | "waiting_for_input"
  | "waiting_for_evidence"
  | "needs_review"
  | "blocked"
  | "completed"
  | "archived";

export type OperationalObjectDomain =
  | "research"
  | "evidence"
  | "countries"
  | "companies"
  | "universities"
  | "governance"
  | "investor"
  | "reports"
  | "knowledge"
  | "general";

export type OperationalObjectPriority = "low" | "normal" | "high";

/**
 * Additive structured payload attached by the Adaptive Intelligence Workspace
 * activation flow (Starter Work Card). Optional so every legacy record keeps
 * working; the store already preserves extra fields on read/write.
 */
export type OperationalObjectActivationPayload = {
  readonly schema: number;
  readonly card: Record<string, unknown> | object;
};

export type OperationalObjectProvenance = {
  readonly source: "typed_command" | "voice_command" | "manual" | "existing_object";
  readonly originalText?: string;
  readonly routePath?: string;
  readonly locale?: string;
  readonly inferredFields?: readonly string[];
  readonly relatedEntityKind?: string;
  readonly relatedEntityId?: string;
  readonly relatedEntityName?: string;
  readonly graphNodeId?: string;
};

export type OperationalObject = {
  readonly id: string;
  readonly version: number;
  readonly type: OperationalObjectType;
  readonly title: string;
  readonly summary: string;
  readonly objective: string;
  readonly rationale: string;
  readonly expectedOutcome: string;
  readonly domain: OperationalObjectDomain;
  readonly status: OperationalObjectStatus;
  readonly priority: OperationalObjectPriority;
  readonly requiredInputs: readonly string[];
  readonly evidenceRequirements: readonly string[];
  readonly nextAction: string;
  readonly humanDecision: string;
  readonly owner?: string | null;
  readonly knownInformation?: readonly string[];
  readonly missingInformation?: readonly string[];
  readonly assumptions?: readonly string[];
  readonly humanApprovalRequired?: boolean;
  readonly projectId?: string;
  readonly missionId?: string;
  readonly parentId?: string;
  readonly relatedObjectIds: readonly string[];
  readonly sourceCommand?: string;
  readonly locale: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly dueAt?: string;
  readonly provenance: OperationalObjectProvenance;
  readonly activation?: OperationalObjectActivationPayload;
};

/** Unknown fields from future schema versions — preserved on read/write without typing every key. */
export type OperationalObjectRecord = OperationalObject & Record<string, unknown>;

export type OperationalObjectDraft = {
  id?: string;
  type: OperationalObjectType;
  title: string;
  summary: string;
  objective: string;
  rationale: string;
  expectedOutcome: string;
  domain: OperationalObjectDomain;
  status: OperationalObjectStatus;
  priority: OperationalObjectPriority;
  requiredInputs: readonly string[];
  evidenceRequirements: readonly string[];
  nextAction: string;
  humanDecision: string;
  owner?: string | null;
  knownInformation?: readonly string[];
  missingInformation?: readonly string[];
  assumptions?: readonly string[];
  humanApprovalRequired?: boolean;
  projectId?: string;
  missionId?: string;
  parentId?: string;
  relatedObjectIds: readonly string[];
  sourceCommand?: string;
  locale: string;
  dueAt?: string;
  provenance: OperationalObjectProvenance;
  activation?: OperationalObjectActivationPayload;
};

export type OperationalObjectFilter =
  | "all"
  | "draft"
  | "active"
  | "waiting"
  | "review"
  | "completed";

export function isOperationalObjectType(value: unknown): value is OperationalObjectType {
  return (
    value === "project" ||
    value === "mission" ||
    value === "work_plan" ||
    value === "task" ||
    value === "research_question" ||
    value === "evidence_request" ||
    value === "review" ||
    value === "decision_brief" ||
    value === "meeting_action" ||
    value === "meeting" ||
    value === "intelligence_room" ||
    value === "source_review" ||
    value === "country_watch" ||
    value === "indicator_watch" ||
    value === "pdf_review" ||
    value === "report_draft" ||
    value === "decision_review"
  );
}

export function isOperationalObjectStatus(value: unknown): value is OperationalObjectStatus {
  return (
    value === "draft" ||
    value === "ready" ||
    value === "active" ||
    value === "waiting_for_input" ||
    value === "waiting_for_evidence" ||
    value === "needs_review" ||
    value === "blocked" ||
    value === "completed" ||
    value === "archived"
  );
}

export function isOperationalObjectDomain(value: unknown): value is OperationalObjectDomain {
  return (
    value === "research" ||
    value === "evidence" ||
    value === "countries" ||
    value === "companies" ||
    value === "universities" ||
    value === "governance" ||
    value === "investor" ||
    value === "reports" ||
    value === "knowledge" ||
    value === "general"
  );
}

export function isOperationalObject(value: unknown): value is OperationalObject {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    isOperationalObjectType(o.type) &&
    isOperationalObjectStatus(o.status) &&
    isOperationalObjectDomain(o.domain)
  );
}
