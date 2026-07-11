import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import { buildResearchReviewWorkspace } from "@/lib/research/intelligence/review-workspace-engine";
import { getWorkspaceTimeline } from "@/lib/research/intelligence/workspace-shell-engine";
import { getResearchGraphForTopicObject } from "@/lib/research/graph";
import { RESEARCH_ENTITY_REGISTRY } from "@/lib/research/entities";
import type { ResearchEntity } from "@/lib/research/entities";
import {
  toEvidence,
  toMission,
  toRelationships,
} from "@/lib/foundation/adapters/research-foundation-adapter";
import { buildRelationship } from "@/lib/relationships/relationship-builder";
import type { Relationship } from "@/lib/foundation/foundation-model";
import { buildResearchEntityBase } from "@/lib/research-domain/research-domain-builder";
import type {
  HypothesisEntity,
  ResearchMissionEntity,
  ResearchQuestionEntity,
  ResearchTopicEntity,
} from "@/lib/research-domain/research-entities-intent";
import type { DatasetEntity } from "@/lib/research-domain/research-entities-artifacts";
import type { LaboratoryEntity } from "@/lib/research-domain/research-entities-organizations";
import type { FindingEntity } from "@/lib/research-domain/research-entities-outcomes";
import type { ResearcherEntity } from "@/lib/research-domain/research-entities-people";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";

/**
 * Research Domain Adapter — pure translation from real, already-shipped repository data
 * (lib/research/*, lib/foundation/adapters/research-foundation-adapter.ts,
 * lib/relationships/relationship-builder.ts) onto the Research Domain Foundation
 * (lib/research-domain/, Phase 1). No new evidence, relationship, or catalog logic is
 * introduced here — every function below composes an existing, real source. Entity kinds with
 * no real backing data anywhere in this repository (Engineer, Scientist, Academic, Student
 * Researcher, University, Research Center, Funding Opportunity, Grant, Sponsor, Peer Review,
 * Publication, Patent, Technology, Methodology, Experiment, Research Outcome, Research Impact)
 * are honestly left unmapped this phase — not fabricated to fill the roster.
 */

/**
 * Knowledge Graph → Relationships. Only the graph's "related_topic" edges are converted —
 * "uses_method"/"requires_evidence" edges describe the exact same catalog fields
 * `toRelationships()` (EPIC-02/03) already converts, and re-converting them here would
 * duplicate that existing intelligence. "future_supports" edges are deliberately excluded: they
 * name aspirational product roadmap items, not real research connections, and converting them
 * into a Relationship record would overclaim that a connection exists today.
 */
export function toKnowledgeGraphRelationships(topic: ResearchTopic): readonly Relationship[] {
  const graph = getResearchGraphForTopicObject(topic);
  const focusNodeId = `topic:${topic.topicId}`;

  return graph.edges
    .filter(
      (edge) =>
        edge.relationshipType === "related_topic" &&
        edge.status === "catalog_available" &&
        edge.sourceNodeId === focusNodeId,
    )
    .map((edge) => {
      const targetTopicId = edge.targetNodeId.replace(/^topic:/, "");
      return buildRelationship({
        sourceId: topic.topicId,
        targetId: targetTopicId,
        relationshipType: "related_to",
        explanation: edge.label ?? "Related by shared catalog metadata.",
        source: "research-graph",
      });
    });
}

/**
 * A topic's own open questions, from the real Review Workspace (EPIC-02's ReviewOpenQuestion,
 * itself a direct alias of the Foundation's Question type). Empty when the topic has none.
 */
export function toResearchQuestionEntities(topic: ResearchTopic): readonly ResearchQuestionEntity[] {
  const workspace = buildResearchReviewWorkspace(topic.topicId);
  if (!workspace) {
    return [];
  }

  const mission = toMission(topic);

  return workspace.openQuestions.map((question) => ({
    ...buildResearchEntityBase({
      entityId: `research-question:${question.questionId}`,
      entityKind: "research_question",
      label: question.question,
      lifecycleState: "active",
      missions: [mission],
      source: "research-review-workspace",
    }),
    entityKind: "research_question" as const,
    question,
  }));
}

/**
 * A topic's own findings, from the real Review Workspace. `ResearchFinding` has no persistence
 * layer anywhere in this platform yet, so `workspace.findings` — and therefore this function's
 * result — is always empty today. The mapping is real and correct; it will honestly start
 * producing entities the moment a persistence layer exists, with no change needed here.
 */
export function toFindingEntities(topic: ResearchTopic): readonly FindingEntity[] {
  const workspace = buildResearchReviewWorkspace(topic.topicId);
  if (!workspace) {
    return [];
  }

  return workspace.findings.map((finding) => ({
    ...buildResearchEntityBase({
      entityId: `finding:${finding.findingId}`,
      entityKind: "finding",
      label: finding.summary,
      lifecycleState: "active",
      timeline: [
        { eventId: `finding-recorded:${finding.findingId}`, occurredAt: finding.createdAt, description: `Finding "${finding.summary}" recorded.` },
      ],
      source: "research-review-workspace",
    }),
    entityKind: "finding" as const,
    statement: finding.summary,
  }));
}

/** The Foundation-aligned Research Topic entity — the richest, most complete mapping this phase. */
export function toResearchTopicEntity(topic: ResearchTopic): ResearchTopicEntity {
  const evidenceReview = buildTopicEvidenceReview(topic.topicId);
  const evidence = evidenceReview ? evidenceReview.evidenceItems.map(toEvidence) : [];
  const relationships = [
    ...toRelationships(topic),
    ...toKnowledgeGraphRelationships(topic),
  ];
  const timeline = getWorkspaceTimeline(topic.topicId).map((event) => ({
    eventId: event.eventId,
    occurredAt: event.occurredAt,
    description: event.description,
  }));
  const mission = toMission(topic);

  return {
    ...buildResearchEntityBase({
      entityId: `research-topic:${topic.topicId}`,
      entityKind: "research_topic",
      label: topic.topicName,
      lifecycleState: topic.status === "workspace_not_available" ? "proposed" : "active",
      relationships,
      evidence,
      missions: [mission],
      timeline,
      source: "research-topics-catalog",
    }),
    entityKind: "research_topic",
    domain: topic.domain,
    description: `${topic.topicName} within ${topic.domain}.`,
  };
}

/** The Research Mission entity a topic's own investigation serves — parallel to, not embedded in, the topic. */
export function toResearchMissionEntity(topic: ResearchTopic): ResearchMissionEntity {
  const mission = toMission(topic);

  return {
    ...buildResearchEntityBase({
      entityId: `research-mission:${topic.topicId}`,
      entityKind: "research_mission",
      label: mission.statement,
      lifecycleState: "active",
      missions: [mission],
      source: "research-topics-catalog",
    }),
    entityKind: "research_mission",
    statement: mission.statement,
  };
}

/**
 * lib/research/entities/'s real registry is mapped into the Domain's ResearchEntityKind only
 * for the two entity types below (`toLaboratoryEntity`, `toDatasetEntity`). Deliberately
 * narrower than lib/foundation/adapters/research-entity-network-adapter.ts's EPIC-08 mapping
 * (which targets the Network's separate IntelligenceEntityKind vocabulary) — the two mappings
 * serve different target vocabularies and are not duplicates of each other, but this one
 * additionally excludes "research_topic" (the canonical Research Topic entity above already
 * covers all 65 real topics from the richer research-topics.ts catalog; re-mapping the entities
 * registry's 5 stub research_topic records would duplicate those, not add new information) and
 * "method"/"open_question"/"negative_result" (no honest match in the Domain's 27-kind
 * vocabulary — excluded, not forced, the same discipline EPIC-08 established).
 */
function toOrganizationLinks(entity: ResearchEntity): readonly string[] {
  return entity.relatedEntityIds.filter((id) =>
    RESEARCH_ENTITY_REGISTRY.some(
      (candidate) => candidate.entityId === id && candidate.entityType === "laboratory",
    ),
  );
}

export function toLaboratoryEntity(entity: ResearchEntity): LaboratoryEntity | undefined {
  if (entity.entityType !== "laboratory") {
    return undefined;
  }

  return {
    ...buildResearchEntityBase({
      entityId: `laboratory:${entity.entityId}`,
      entityKind: "laboratory",
      label: entity.displayName,
      lifecycleState: "active",
      source: "research-entities-registry",
    }),
    entityKind: "laboratory",
  };
}

export function toDatasetEntity(entity: ResearchEntity): DatasetEntity | undefined {
  if (entity.entityType !== "dataset") {
    return undefined;
  }

  return {
    ...buildResearchEntityBase({
      entityId: `dataset:${entity.entityId}`,
      entityKind: "dataset",
      label: entity.displayName,
      lifecycleState: "active",
      organizationIds: toOrganizationLinks(entity),
      source: "research-entities-registry",
    }),
    entityKind: "dataset",
    description: entity.description,
  };
}

/**
 * Researchers. No real researcher record exists anywhere in this repository today — the
 * registry, the catalog, and every other real data source contain zero entries of this kind.
 * This function is real and correct, not a stub: it honestly returns an empty array rather than
 * fabricate a researcher to populate the roster.
 */
export function mapResearchers(): readonly ResearcherEntity[] {
  return [];
}

/** No real hypothesis record exists anywhere in this repository today. See mapResearchers(). */
export function mapHypotheses(): readonly HypothesisEntity[] {
  return [];
}

/**
 * Every Research Domain entity this phase can honestly build from real, already-shipped
 * repository data: one ResearchTopicEntity and one ResearchMissionEntity per real catalog topic
 * (65), plus every laboratory/dataset entry the entities registry actually contains, plus every
 * real open question and finding the Review Workspace reports for each topic.
 */
export function buildAllResearchDomainEntities(): readonly ResearchDomainEntity[] {
  const topicEntities = RESEARCH_TOPICS.flatMap((topic) => [
    toResearchTopicEntity(topic),
    toResearchMissionEntity(topic),
    ...toResearchQuestionEntities(topic),
    ...toFindingEntities(topic),
  ]);

  const registryEntities = RESEARCH_ENTITY_REGISTRY.flatMap((entity) => {
    const laboratory = toLaboratoryEntity(entity);
    const dataset = toDatasetEntity(entity);
    return [laboratory, dataset].filter((value): value is NonNullable<typeof value> => value !== undefined);
  });

  return [...topicEntities, ...registryEntities, ...mapResearchers(), ...mapHypotheses()];
}
