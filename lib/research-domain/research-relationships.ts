// Research Intelligence Domain — Relationships. This is documentation expressed as typed data,
// not a validator and not business logic: it records which of the Platform's own 16
// RelationshipType values (lib/foundation/relationship-types.ts, EPIC-03) are the realistic fit
// for common Research entity-pair connections, so every future engine or adapter for this
// domain reuses the same vocabulary instead of inventing a parallel one. No new RelationshipType
// value was needed — 15 of the existing 16 values have a natural fit below; "measures" has no
// forced example here and remains available, unused, for a future real connection (e.g. an
// Experiment that measures a Dataset) rather than being stretched to fit something it doesn't
// honestly describe.
//
// Actual connections between real entities are still built with lib/relationships/'s
// `buildRelationship` (unmodified, reused as-is) — this table is a reference, never constructed
// or consumed at runtime by anything in this module.

import type { RelationshipType } from "@/lib/foundation/relationship-types";
import type { ResearchEntityKind } from "@/lib/research-domain/research-entity-base";
import type {
  HypothesisEntity,
  MethodologyEntity,
  ResearchMissionEntity,
  ResearchProgramEntity,
  ResearchProjectEntity,
  ResearchQuestionEntity,
  ResearchTopicEntity,
} from "@/lib/research-domain/research-entities-intent";
import type {
  DatasetEntity,
  ExperimentEntity,
  PatentEntity,
  PublicationEntity,
  TechnologyEntity,
} from "@/lib/research-domain/research-entities-artifacts";
import type {
  AcademicEntity,
  EngineerEntity,
  ResearcherEntity,
  ScientistEntity,
  StudentResearcherEntity,
} from "@/lib/research-domain/research-entities-people";
import type {
  LaboratoryEntity,
  ResearchCenterEntity,
  UniversityEntity,
} from "@/lib/research-domain/research-entities-organizations";
import type {
  FundingOpportunityEntity,
  GrantEntity,
  SponsorEntity,
} from "@/lib/research-domain/research-entities-funding";
import type {
  FindingEntity,
  PeerReviewEntity,
  ResearchImpactEntity,
  ResearchOutcomeEntity,
} from "@/lib/research-domain/research-entities-outcomes";

export interface ResearchRelationshipPattern {
  from: ResearchEntityKind;
  relationshipType: RelationshipType;
  to: ResearchEntityKind;
  meaning: string;
}

export const RESEARCH_RELATIONSHIP_PATTERNS: readonly ResearchRelationshipPattern[] = [
  { from: "researcher", relationshipType: "belongs_to", to: "laboratory", meaning: "Researcher is affiliated with a laboratory." },
  { from: "researcher", relationshipType: "belongs_to", to: "university", meaning: "Researcher is affiliated with a university." },
  { from: "student_researcher", relationshipType: "belongs_to", to: "laboratory", meaning: "Student researcher works in a laboratory." },
  { from: "laboratory", relationshipType: "belongs_to", to: "university", meaning: "Laboratory is hosted by a university." },
  { from: "laboratory", relationshipType: "belongs_to", to: "research_center", meaning: "Laboratory is part of a research center." },
  { from: "researcher", relationshipType: "collaborates_with", to: "researcher", meaning: "Two researchers work together." },
  { from: "university", relationshipType: "collaborates_with", to: "university", meaning: "Two universities partner on research." },
  { from: "researcher", relationshipType: "creates", to: "publication", meaning: "Researcher authored a publication." },
  { from: "researcher", relationshipType: "creates", to: "patent", meaning: "Researcher filed a patent." },
  { from: "publication", relationshipType: "creates", to: "finding", meaning: "Publication reports a finding." },
  { from: "research_project", relationshipType: "belongs_to", to: "research_program", meaning: "Project is grouped under a program." },
  { from: "research_program", relationshipType: "belongs_to", to: "research_mission", meaning: "Program serves a mission." },
  { from: "research_project", relationshipType: "funded_by", to: "grant", meaning: "Project is funded by a grant." },
  { from: "grant", relationshipType: "funded_by", to: "sponsor", meaning: "Grant is provided by a sponsor." },
  { from: "research_project", relationshipType: "depends_on", to: "funding_opportunity", meaning: "Project's continuation depends on a funding opportunity being secured." },
  { from: "experiment", relationshipType: "uses", to: "methodology", meaning: "Experiment follows a documented methodology." },
  { from: "experiment", relationshipType: "creates", to: "dataset", meaning: "Experiment produces a dataset." },
  { from: "experiment", relationshipType: "regulated_by", to: "peer_review", meaning: "Experiment requires ethics/peer review approval before proceeding." },
  { from: "finding", relationshipType: "supports", to: "hypothesis", meaning: "Finding corroborates a hypothesis." },
  { from: "finding", relationshipType: "contradicts", to: "hypothesis", meaning: "Finding conflicts with a hypothesis." },
  { from: "hypothesis", relationshipType: "depends_on", to: "research_question", meaning: "Hypothesis is proposed in answer to a research question." },
  { from: "publication", relationshipType: "references", to: "publication", meaning: "Publication cites another publication." },
  { from: "peer_review", relationshipType: "related_to", to: "publication", meaning: "Peer review evaluates a publication (generic connection — no more specific type fits a review act itself)." },
  { from: "technology", relationshipType: "extends", to: "technology", meaning: "Technology builds on a prior technology." },
  { from: "technology", relationshipType: "improves", to: "technology", meaning: "Technology is an improved version of a prior one." },
  { from: "technology", relationshipType: "replaces", to: "technology", meaning: "Technology supersedes a prior one." },
  { from: "patent", relationshipType: "extends", to: "technology", meaning: "Patent extends a described technology." },
  { from: "research_project", relationshipType: "creates", to: "research_outcome", meaning: "Project produces an outcome." },
  { from: "research_outcome", relationshipType: "affects", to: "research_impact", meaning: "Outcome leads to a downstream impact." },
] as const;

/**
 * The discriminated union of every Research Intelligence domain entity — useful for exhaustive
 * type narrowing on `entityKind`. Purely a type-level convenience; nothing in this module
 * constructs one.
 */
export type ResearchDomainEntity =
  | ResearchMissionEntity
  | ResearchProgramEntity
  | ResearchProjectEntity
  | ResearchTopicEntity
  | ResearchQuestionEntity
  | HypothesisEntity
  | MethodologyEntity
  | ExperimentEntity
  | DatasetEntity
  | PublicationEntity
  | PatentEntity
  | TechnologyEntity
  | ResearcherEntity
  | EngineerEntity
  | ScientistEntity
  | AcademicEntity
  | StudentResearcherEntity
  | LaboratoryEntity
  | ResearchCenterEntity
  | UniversityEntity
  | FundingOpportunityEntity
  | GrantEntity
  | SponsorEntity
  | PeerReviewEntity
  | FindingEntity
  | ResearchOutcomeEntity
  | ResearchImpactEntity;
