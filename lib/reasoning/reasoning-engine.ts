import type { Evidence, Question, Relationship } from "@/lib/foundation/foundation-model";
import type { VerificationStatus } from "@/lib/foundation/evidence-types";
import type { RelationshipType } from "@/lib/foundation/relationship-types";
import type {
  KnownUnknown,
  ObservedFact,
  ReasoningConsequence,
  ReasoningInput,
  ReasoningOption,
  ReasoningResult,
  ReasoningRisk,
  ReasoningStep,
  ReasoningTradeOff,
} from "@/lib/foundation/reasoning-types";
import { compareEvidence } from "@/lib/evidence/evidence-query";
import { findRelationshipsByType } from "@/lib/relationships/relationship-query";

/**
 * Deterministic Intelligence Reasoning Framework. Every function here is a pure transformation
 * of its ReasoningInput — no model call, no invented option, no fabricated confidence. See
 * lib/foundation/reasoning-types.ts for the output shape and the honesty rules each field
 * carries.
 */

const UNRESOLVED_VERIFICATION_STATUSES: ReadonlySet<VerificationStatus | undefined> = new Set([
  undefined,
  "not_started",
  "verification_pending",
]);

function isUnresolvedVerification(status: VerificationStatus | undefined): boolean {
  return UNRESOLVED_VERIFICATION_STATUSES.has(status);
}

/** Only evidence explicitly marked "verified" is stated as an observed fact — never assumed. */
function deriveObservedFacts(evidence: readonly Evidence[]): readonly ObservedFact[] {
  return evidence
    .filter((item) => item.verificationStatus === "verified")
    .map((item) => ({ statement: item.label, evidenceIds: [item.evidenceId] }));
}

/** Every evidence record whose verification is genuinely unresolved becomes a named unknown. */
function deriveKnownUnknowns(evidence: readonly Evidence[]): readonly KnownUnknown[] {
  return evidence
    .filter((item) => isUnresolvedVerification(item.verificationStatus))
    .map((item) => ({
      question: `Has "${item.label}" been verified?`,
      reason: item.verificationStatus
        ? `Verification status: ${item.verificationStatus}.`
        : "No verification status has been recorded for this evidence yet.",
    }));
}

/** Partition evidence using only each record's own declared supporting/conflicting links. */
function partitionEvidenceByLink(evidence: readonly Evidence[]): {
  supporting: readonly Evidence[];
  conflicting: readonly Evidence[];
} {
  const supportingIds = new Set<string>();
  const conflictingIds = new Set<string>();

  for (let i = 0; i < evidence.length; i += 1) {
    for (let j = i + 1; j < evidence.length; j += 1) {
      const { relation } = compareEvidence(evidence[i], evidence[j]);
      if (relation === "supports") {
        supportingIds.add(evidence[i].evidenceId);
        supportingIds.add(evidence[j].evidenceId);
      } else if (relation === "conflicts") {
        conflictingIds.add(evidence[i].evidenceId);
        conflictingIds.add(evidence[j].evidenceId);
      }
    }
  }

  return {
    supporting: evidence.filter((item) => supportingIds.has(item.evidenceId)),
    conflicting: evidence.filter((item) => conflictingIds.has(item.evidenceId)),
  };
}

/** Relationship types that describe an actionable alternative path, not just an observation. */
const OPTION_RELATIONSHIP_TYPES: readonly RelationshipType[] = [
  "improves",
  "replaces",
  "extends",
  "uses",
];

function deriveOptions(relationships: readonly Relationship[]): readonly ReasoningOption[] {
  return OPTION_RELATIONSHIP_TYPES.flatMap((type) =>
    findRelationshipsByType(relationships, type).map((relationship) => {
      const relationshipEvidence = relationship.evidence ?? [];
      return {
        optionId: relationship.relationshipId,
        label: relationship.explanation,
        relationshipId: relationship.relationshipId,
        supportingEvidenceIds: relationshipEvidence.map((item) => item.evidenceId),
        conflictingEvidenceIds: relationshipEvidence.flatMap(
          (item) => item.conflictingEvidenceIds ?? [],
        ),
        support: relationship.confidence ?? "unverified",
      };
    }),
  );
}

/** One trade-off per option that has a real, declared conflict — never an invented pro/con. */
function deriveTradeOffs(options: readonly ReasoningOption[]): readonly ReasoningTradeOff[] {
  return options
    .filter((option) => option.conflictingEvidenceIds.length > 0)
    .map((option) => ({
      optionId: option.optionId,
      description: `${option.conflictingEvidenceIds.length} conflicting evidence record(s) are declared against this option.`,
    }));
}

/** Risks come only from real, caller-declared "contradicts" relationships. */
function deriveRisks(relationships: readonly Relationship[]): readonly ReasoningRisk[] {
  return findRelationshipsByType(relationships, "contradicts").map((relationship) => ({
    riskId: relationship.relationshipId,
    description: relationship.explanation,
    severity: relationship.strength ?? "unknown",
    relationshipId: relationship.relationshipId,
  }));
}

/** Consequences come only from real, caller-declared "affects" relationships. */
function deriveConsequences(
  relationships: readonly Relationship[],
): readonly ReasoningConsequence[] {
  return findRelationshipsByType(relationships, "affects").map((relationship) => ({
    description: relationship.explanation,
    relationshipId: relationship.relationshipId,
  }));
}

function buildReasoningPath(
  input: ReasoningInput,
  observedFacts: readonly ObservedFact[],
  knownUnknowns: readonly KnownUnknown[],
  supporting: readonly Evidence[],
  conflicting: readonly Evidence[],
  options: readonly ReasoningOption[],
): readonly ReasoningStep[] {
  const steps: ReasoningStep[] = [
    {
      stepId: `${input.subjectId}:step:evidence-collected`,
      description: `Collected ${input.evidence.length} evidence record(s) for "${input.question.question}".`,
      evidenceIds: input.evidence.map((item) => item.evidenceId),
    },
    {
      stepId: `${input.subjectId}:step:evidence-partitioned`,
      description: `Found ${supporting.length} supporting and ${conflicting.length} conflicting evidence record(s) based on declared links.`,
      evidenceIds: [...supporting, ...conflicting].map((item) => item.evidenceId),
    },
    {
      stepId: `${input.subjectId}:step:facts-observed`,
      description: `Confirmed ${observedFacts.length} observed fact(s) from verified evidence.`,
      evidenceIds: observedFacts.flatMap((fact) => fact.evidenceIds),
    },
    {
      stepId: `${input.subjectId}:step:unknowns-identified`,
      description: `Identified ${knownUnknowns.length} known unknown(s) from unresolved verification status.`,
      evidenceIds: [],
    },
  ];

  if (input.relationships && input.relationships.length > 0) {
    steps.push({
      stepId: `${input.subjectId}:step:relationships-reviewed`,
      description: `Reviewed ${input.relationships.length} relationship(s), deriving ${options.length} possible option(s).`,
      evidenceIds: [],
    });
  }

  if (input.timeline && input.timeline.length > 0) {
    steps.push({
      stepId: `${input.subjectId}:step:timeline-reviewed`,
      description: `Reviewed ${input.timeline.length} timeline event(s).`,
      evidenceIds: [],
    });
  }

  return steps;
}

function buildHumanDecisionReason(
  conflicting: readonly Evidence[],
  knownUnknowns: readonly KnownUnknown[],
  risks: readonly ReasoningRisk[],
): string {
  if (conflicting.length > 0) {
    return "Conflicting evidence is present and must be resolved by a human reviewer before acting.";
  }
  if (risks.length > 0) {
    return "Declared risks require human judgment to weigh before any option is chosen.";
  }
  if (knownUnknowns.length > 0) {
    return "Open unknowns remain that this framework cannot resolve from the evidence it was given.";
  }
  return "This framework produces reasoning and evidence traceability only — it never selects a decision on a human's behalf.";
}

function knownUnknownsToQuestions(
  subjectId: string,
  knownUnknowns: readonly KnownUnknown[],
): readonly Question[] {
  return knownUnknowns.map((unknown, index) => ({
    questionId: `${subjectId}:open-question:${index}`,
    question: unknown.question,
  }));
}

/**
 * Build a complete, explainable ReasoningResult from real evidence, relationships, and a
 * timeline — never from a model. Works identically for every domain (Research, Governance,
 * Economic, Engineering, Education, Law, Healthcare, Technology, Climate, ...) because it only
 * consumes the Foundation's domain-agnostic types.
 */
export function buildReasoningResult(input: ReasoningInput): ReasoningResult {
  const relationships = input.relationships ?? [];

  const observedFacts = deriveObservedFacts(input.evidence);
  const knownUnknowns = deriveKnownUnknowns(input.evidence);
  const { supporting, conflicting } = partitionEvidenceByLink(input.evidence);
  const possibleOptions = deriveOptions(relationships);
  const tradeOffs = deriveTradeOffs(possibleOptions);
  const risks = deriveRisks(relationships);
  const potentialConsequences = deriveConsequences(relationships);

  return {
    subjectId: input.subjectId,
    question: input.question,
    observedFacts,
    knownUnknowns,
    supportingEvidence: supporting,
    conflictingEvidence: conflicting,
    reasoningPath: buildReasoningPath(
      input,
      observedFacts,
      knownUnknowns,
      supporting,
      conflicting,
      possibleOptions,
    ),
    possibleOptions,
    tradeOffs,
    risks,
    potentialConsequences,
    openQuestions: knownUnknownsToQuestions(input.subjectId, knownUnknowns),
    humanDecisionRequired: true,
    humanDecisionReason: buildHumanDecisionReason(conflicting, knownUnknowns, risks),
  };
}
