// Research Intelligence Domain — the "intent" cluster: what is being investigated and why.
// Types only, extending CBAI Platform RC-1. See research-entity-base.ts for the eight shared
// concerns every entity below carries (Identity, Lifecycle, Relationships, Evidence Links,
// Mission Links, Organization Links, Timeline, Traceability).

import type { Question } from "@/lib/foundation/foundation-model";
import type { ResearchEntityBase } from "@/lib/research-domain/research-entity-base";

/** The broadest scope — a durable, multi-program research direction. */
export interface ResearchMissionEntity extends ResearchEntityBase {
  entityKind: "research_mission";
  statement: string;
}

/** A funded, organized grouping of related research projects under one mission. */
export interface ResearchProgramEntity extends ResearchEntityBase {
  entityKind: "research_program";
  description: string;
}

/** A bounded, resourced unit of research work within a program. */
export interface ResearchProjectEntity extends ResearchEntityBase {
  entityKind: "research_project";
  description: string;
}

/**
 * A subject-matter area under investigation. Deliberately not the same type as
 * lib/research/research-topics.ts's `ResearchTopic` — that is the existing catalog record this
 * domain model does not modify or replace; this is the Foundation-aligned representation a
 * future adapter may build from it.
 */
export interface ResearchTopicEntity extends ResearchEntityBase {
  entityKind: "research_topic";
  domain: string;
  description: string;
}

/**
 * A process- or evidence-level question about a topic. Embeds the Platform's own Question
 * pillar directly (`lib/foundation/foundation-model.ts`) rather than re-declaring question text
 * as a new field — the question *is* a Foundation Question, not a lookalike of one.
 */
export interface ResearchQuestionEntity extends ResearchEntityBase {
  entityKind: "research_question";
  question: Question;
}

/** A testable, falsifiable claim proposed in answer to one or more research questions. */
export interface HypothesisEntity extends ResearchEntityBase {
  entityKind: "hypothesis";
  statement: string;
  relatedQuestionIds: readonly string[];
}

/** A documented method or protocol a study follows. */
export interface MethodologyEntity extends ResearchEntityBase {
  entityKind: "methodology";
  description: string;
}
