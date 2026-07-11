import type {
  Evidence,
  Mission,
  Relationship,
  TimelineEvent,
} from "@/lib/foundation/foundation-model";
import type {
  ResearchEntityBase,
  ResearchEntityKind,
  ResearchEntityLifecycleState,
} from "@/lib/research-domain/research-entity-base";

export interface BuildResearchEntityBaseInput {
  entityId: string;
  entityKind: ResearchEntityKind;
  label: string;
  /** Required, not defaulted — an honest lifecycle claim must be a deliberate choice by the caller, never a guessed default. */
  lifecycleState: ResearchEntityLifecycleState;
  relationships?: readonly Relationship[];
  evidence?: readonly Evidence[];
  missions?: readonly Mission[];
  organizationIds?: readonly string[];
  timeline?: readonly TimelineEvent[];
  source?: string;
}

/**
 * Construct the shared base every Research entity extends. Every unsupplied collection defaults
 * to an honest empty array — never fabricated content — matching the same "missing data stays
 * empty" rule every Platform Core builder (buildEvidence, buildRelationship, createWorkflow)
 * already follows.
 */
export function buildResearchEntityBase(input: BuildResearchEntityBaseInput): ResearchEntityBase {
  return {
    entityId: input.entityId,
    entityKind: input.entityKind,
    label: input.label,
    lifecycleState: input.lifecycleState,
    relationships: input.relationships ?? [],
    evidence: input.evidence ?? [],
    missions: input.missions ?? [],
    organizationIds: input.organizationIds ?? [],
    timeline: input.timeline ?? [],
    source: input.source,
  };
}
