// The universal Intelligence Foundation. Every future ecosystem (Research, Governance,
// Economic, Education, Engineering, Legal, ...) is expected to express its domain concepts in
// terms of these ten pillars. Nothing here is domain-specific — no medicine, no government, no
// research-only vocabulary. Domain modules own their own data; this module only defines the
// shared shape that lets different domains be understood, composed, and displayed the same way.

/** The thing an intelligence workflow is about — a research topic, a country, an indicator. */
export interface Subject {
  subjectId: string;
  subjectLabel: string;
  subjectKind: string;
}

/** The purpose of the current investigation, in one sentence. Never a fabricated goal. */
export interface Mission {
  subjectId: string;
  statement: string;
}

/** A process- or evidence-level question — never a fabricated scientific/domain claim. */
export interface Question {
  questionId: string;
  question: string;
}

/** A single piece of catalog or connected evidence, with an honest connection status. */
export interface Evidence {
  evidenceId: string;
  label: string;
  status: string;
  note?: string;
}

/** A directed connection between two subjects, entities, or evidence records. */
export interface Relationship {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
}

/** A deterministic assessment of a subject's current state, with reasons — never a score. */
export interface Analysis {
  subjectId: string;
  summary: string;
  reasons: readonly string[];
}

/** One evidence-supported option — never a command, never the only path presented as certain. */
export interface Recommendation {
  recommendationId: string;
  label: string;
  reason: string;
}

/** A real, working path into the product for a recommendation — absent when none exists. */
export interface Execution {
  label: string;
  href: string;
}

/** A single dated activity entry — never fabricated when no real event log exists. */
export interface TimelineEvent {
  eventId: string;
  occurredAt: string;
  description: string;
}

/** A durable unit of accumulated understanding — a note or a finding, kept, not overwritten. */
export interface Knowledge {
  knowledgeId: string;
  body: string;
  createdAt: string;
}
