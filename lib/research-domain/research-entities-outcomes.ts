// Research Intelligence Domain — the "outcomes" cluster: evaluation and results. Types only,
// extending CBAI Platform RC-1. See research-entity-base.ts for the eight shared concerns every
// entity below carries. None of these carry a score or a verdict field — a review's or a
// finding's real substance lives in its linked Evidence and Relationships, never in a
// fabricated rating.

import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";

/** A review event evaluating another entity (typically a Publication or a Grant proposal). */
export interface PeerReviewEntity extends ResearchEntityBase {
  entityKind: "peer_review";
  reviewedEntityIds: readonly string[];
}

/** A discrete result observed during research — supports or conflicts with a Hypothesis via Relationships/Evidence, never a standalone verdict. */
export interface FindingEntity extends ResearchEntityBase {
  entityKind: "finding";
  statement: string;
}

/** A concrete deliverable or result a project/program produced. */
export interface ResearchOutcomeEntity extends ResearchEntityBase {
  entityKind: "research_outcome";
  description: string;
}

/** A downstream effect of research — on policy, industry, health, or another real domain. */
export interface ResearchImpactEntity extends ResearchEntityBase {
  entityKind: "research_impact";
  description: string;
}
