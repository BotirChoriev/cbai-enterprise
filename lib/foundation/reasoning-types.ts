// Universal Reasoning shapes — domain-agnostic, shared by every ecosystem. These types describe
// structured, explainable decision support, never a decision. lib/reasoning/reasoning-engine.ts
// is the only place that constructs a ReasoningResult; every field here traces back to a real
// Evidence or Relationship record, never a model-generated claim.

import type {
  Evidence,
  Mission,
  Question,
  Relationship,
  TimelineEvent,
} from "@/lib/foundation/foundation-model";
import type { Confidence } from "@/lib/foundation/confidence";
import type { RelationshipStrength } from "@/lib/foundation/relationship-types";

/**
 * Everything a reasoning pass is given. Nothing is fetched, assumed, or fabricated inside the
 * engine — every ReasoningResult field traces back to one of these inputs.
 */
export interface ReasoningInput {
  subjectId: string;
  question: Question;
  mission?: Mission;
  evidence: readonly Evidence[];
  relationships?: readonly Relationship[];
  timeline?: readonly TimelineEvent[];
}

/** A fact this reasoning pass can assert, traceable to one or more evidence records. */
export interface ObservedFact {
  statement: string;
  evidenceIds: readonly string[];
}

/** Something the reasoning pass cannot answer from the evidence it was given — named, not hidden. */
export interface KnownUnknown {
  question: string;
  reason: string;
}

/** One step of the reasoning trace — an audit entry, not a hidden inference. */
export interface ReasoningStep {
  stepId: string;
  description: string;
  evidenceIds: readonly string[];
}

/**
 * One possible course of action — always derived from a real, caller-declared Relationship,
 * never invented. `support` reuses the shared Confidence vocabulary so options and evidence
 * describe certainty the same way, not two parallel scales.
 */
export interface ReasoningOption {
  optionId: string;
  label: string;
  relationshipId: string;
  supportingEvidenceIds: readonly string[];
  conflictingEvidenceIds: readonly string[];
  support: Confidence;
}

/** A trade-off attached to one option — count-based, never an invented pro/con narrative. */
export interface ReasoningTradeOff {
  optionId: string;
  description: string;
}

/** Risk severity reuses RelationshipStrength — derived 1:1 from a declared relationship, never scored. */
export type ReasoningRiskSeverity = RelationshipStrength;

/** A risk, always sourced from a real "contradicts" relationship — never inferred from silence. */
export interface ReasoningRisk {
  riskId: string;
  description: string;
  severity: ReasoningRiskSeverity;
  relationshipId: string;
}

/** A potential consequence, always sourced from a real "affects" relationship's own explanation. */
export interface ReasoningConsequence {
  description: string;
  relationshipId: string;
}

/**
 * The complete structured reasoning output — explainable decision support, never a decision.
 * Every field is deterministically derived from ReasoningInput; nothing is model-generated.
 * humanDecisionRequired is always true at the type level — this framework produces reasoning,
 * not decisions. humanDecisionReason explains why, and varies with what was actually found.
 */
export interface ReasoningResult {
  subjectId: string;
  question: Question;
  observedFacts: readonly ObservedFact[];
  knownUnknowns: readonly KnownUnknown[];
  supportingEvidence: readonly Evidence[];
  conflictingEvidence: readonly Evidence[];
  reasoningPath: readonly ReasoningStep[];
  possibleOptions: readonly ReasoningOption[];
  tradeOffs: readonly ReasoningTradeOff[];
  risks: readonly ReasoningRisk[];
  potentialConsequences: readonly ReasoningConsequence[];
  openQuestions: readonly Question[];
  humanDecisionRequired: true;
  humanDecisionReason: string;
}
