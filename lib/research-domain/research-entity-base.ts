// Research Intelligence Domain — Phase 1: Research Domain Foundation. Types only. This module
// extends CBAI Platform RC-1 (frozen — see docs/CBAI-Platform-RC1.md); it does not modify any
// Platform Core file. Every Research entity is a plain data shape built from Platform Core
// pillars (Evidence, Relationship, Mission, TimelineEvent — all reused directly, none
// redeclared) plus a small, closed, domain-specific vocabulary this module owns.
//
// Naming note: every concrete entity interface below carries an "Entity" suffix
// (e.g. ResearchTopicEntity, UniversityEntity) specifically to avoid colliding with
// pre-existing, differently-shaped types of the same short name already in this repo —
// lib/research/research-topics.ts's `ResearchTopic`, lib/universities.ts's `University`, and
// lib/research/entities/research-entity-types.ts's `ResearchEntity`. This module does not
// import, extend, or alter any of those — it is a parallel, Foundation-aligned model, not a
// replacement for them.

import type {
  Evidence,
  Mission,
  Relationship,
  TimelineEvent,
} from "@/lib/foundation/foundation-model";

/**
 * The twenty-seven Research Intelligence entity kinds, a closed vocabulary — the same
 * discipline as RELATIONSHIP_TYPES, WORKFLOW_STATES, and INTELLIGENCE_ENTITY_KINDS in the
 * Platform Core.
 */
export const RESEARCH_ENTITY_KINDS = [
  "research_mission",
  "research_program",
  "research_project",
  "research_topic",
  "research_question",
  "hypothesis",
  "methodology",
  "experiment",
  "dataset",
  "publication",
  "patent",
  "technology",
  "researcher",
  "engineer",
  "scientist",
  "academic",
  "student_researcher",
  "laboratory",
  "research_center",
  "university",
  "funding_opportunity",
  "grant",
  "sponsor",
  "peer_review",
  "finding",
  "research_outcome",
  "research_impact",
] as const;

export type ResearchEntityKind = (typeof RESEARCH_ENTITY_KINDS)[number];

export const RESEARCH_ENTITY_KIND_LABELS: Record<ResearchEntityKind, string> = {
  research_mission: "Research Mission",
  research_program: "Research Program",
  research_project: "Research Project",
  research_topic: "Research Topic",
  research_question: "Research Question",
  hypothesis: "Hypothesis",
  methodology: "Methodology",
  experiment: "Experiment",
  dataset: "Dataset",
  publication: "Publication",
  patent: "Patent",
  technology: "Technology",
  researcher: "Researcher",
  engineer: "Engineer",
  scientist: "Scientist",
  academic: "Academic",
  student_researcher: "Student Researcher",
  laboratory: "Laboratory",
  research_center: "Research Center",
  university: "University",
  funding_opportunity: "Funding Opportunity",
  grant: "Grant",
  sponsor: "Sponsor",
  peer_review: "Peer Review",
  finding: "Finding",
  research_outcome: "Research Outcome",
  research_impact: "Research Impact",
};

/**
 * A generic, entity-agnostic lifecycle — deliberately not WorkflowState (EPIC-06): WorkflowState
 * describes an intelligence *process's* stages (evidence collection, reasoning, decision); this
 * describes any Research entity's own existence lifecycle (a Researcher, a Grant, a Dataset all
 * honestly fit "proposed / active / completed / archived" without forcing process-stage
 * semantics onto things that aren't processes). Closed and small on purpose — inventing a
 * separate lifecycle vocabulary per entity kind would be inventing granularity this Phase's
 * scope does not support.
 */
export const RESEARCH_ENTITY_LIFECYCLE_STATES = [
  "proposed",
  "active",
  "completed",
  "archived",
] as const;

export type ResearchEntityLifecycleState = (typeof RESEARCH_ENTITY_LIFECYCLE_STATES)[number];

export const RESEARCH_ENTITY_LIFECYCLE_STATE_LABELS: Record<ResearchEntityLifecycleState, string> = {
  proposed: "Proposed",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

/**
 * The eight concerns every Research entity supports, per the mission. Each is a direct reuse of
 * a Platform Core pillar, never a redeclaration:
 *
 * - Identity            → entityId, entityKind, label
 * - Lifecycle            → lifecycleState (this module's own small vocabulary, see above)
 * - Relationships        → relationships: readonly Relationship[] (lib/foundation, EPIC-03)
 * - Evidence Links       → evidence: readonly Evidence[] (lib/foundation, EPIC-04)
 * - Mission Links        → missions: readonly Mission[] (lib/foundation, EPIC-02)
 * - Organization Links   → organizationIds: readonly string[] (references other entities'
 *                          entityId — plain ids, not embedded objects, so organization-kind
 *                          entities and the people/artifacts that link to them never form a
 *                          circular embedding)
 * - Timeline             → timeline: readonly TimelineEvent[] (lib/foundation, EPIC-02)
 * - Traceability         → source (same field name/shape as Relationship.source — where this
 *                          entity record itself came from; honestly absent when unknown, never
 *                          fabricated)
 *
 * No field here is a score, a confidence value, or derived business logic — every field is
 * either a real identifier, a real Platform Core object, or an honest optional string.
 */
export interface ResearchEntityBase {
  entityId: string;
  entityKind: ResearchEntityKind;
  label: string;
  lifecycleState: ResearchEntityLifecycleState;
  relationships: readonly Relationship[];
  evidence: readonly Evidence[];
  missions: readonly Mission[];
  organizationIds: readonly string[];
  timeline: readonly TimelineEvent[];
  source?: string;
}
