import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import type { EvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-model";
import { deriveResearchWorkflow } from "@/lib/research/workflow/workflow-engine";
import type { WorkflowResult } from "@/lib/research/workflow/workflow-model";
import { buildResearchReviewWorkspace } from "@/lib/research/intelligence/review-workspace-engine";
import type {
  ResearchFinding,
  ResearchNote,
  ResearchReviewWorkspaceState,
} from "@/lib/research/intelligence/review-workspace-model";
import { getWorkspaceTimeline } from "@/lib/research/intelligence/workspace-shell-engine";
import type { WorkspaceTimelineEvent } from "@/lib/research/intelligence/workspace-shell-model";
import type {
  Analysis,
  Evidence,
  Knowledge,
  Mission,
  Recommendation,
  Relationship,
  Subject,
  TimelineEvent,
} from "@/lib/foundation/foundation-model";
import type { IntelligenceFoundationView } from "@/lib/foundation/foundation-view";

/**
 * Pure adapters mapping Research Intelligence's existing engine outputs onto the universal
 * Intelligence Foundation. Every function here is a translation — none re-derive evidence,
 * readiness, health, review, gap, or decision logic. The existing engines (evidence-topic-
 * builder, intelligence-engine, decision-engine, readiness-engine, health-engine, workflow-
 * engine, review-workspace-engine, workspace-shell-engine) are completely untouched; this file
 * only composes their already-computed output into the shared shape.
 */

export function toSubject(topic: ResearchTopic): Subject {
  return {
    subjectId: topic.topicId,
    subjectLabel: topic.topicName,
    subjectKind: "research_topic",
  };
}

export function toMission(topic: ResearchTopic): Mission {
  return {
    subjectId: topic.topicId,
    statement: `Investigate ${topic.topicName} within ${topic.domain}, using available catalog evidence.`,
  };
}

export function toEvidence(item: TopicEvidenceCatalogItem): Evidence {
  return {
    evidenceId: item.evidenceItemId,
    label: item.label,
    status: item.status,
    note: item.note,
  };
}

/**
 * Relationships from a topic's own catalog fields — the honestly-detectable connections
 * already present in ResearchTopic, not the separate lib/research/entities registry (a
 * broader, not-yet-topic-integrated catalog left as a future foundation integration point).
 */
export function toRelationships(topic: ResearchTopic): readonly Relationship[] {
  const methodRelationships = topic.relatedMethods.map(
    (method, index): Relationship => ({
      relationshipId: `${topic.topicId}:method:${index}`,
      sourceId: topic.topicId,
      targetId: method,
      relationshipType: "uses_method",
    }),
  );

  const evidenceTypeRelationships = topic.relatedEvidenceTypes.map(
    (evidenceType, index): Relationship => ({
      relationshipId: `${topic.topicId}:evidence_type:${index}`,
      sourceId: topic.topicId,
      targetId: evidenceType,
      relationshipType: "requires_evidence_type",
    }),
  );

  return [...methodRelationships, ...evidenceTypeRelationships];
}

export function toAnalysis(intelligence: EvidenceGapIntelligence): Analysis {
  return {
    subjectId: intelligence.topic.topicId,
    summary: `${intelligence.connectedEvidence.length} connected, ${intelligence.disconnectedEvidence.length} disconnected, ${intelligence.reviewGatedEvidence.length} review-gated.`,
    reasons: intelligence.disconnectedEvidence
      .concat(intelligence.reviewGatedEvidence)
      .map((item) => `${item.label}: ${item.note}`),
  };
}

export function toRecommendation(workflow: WorkflowResult): Recommendation {
  return {
    recommendationId: `${workflow.topic.topicId}:${workflow.nextAction}`,
    label: workflow.nextAction,
    reason: workflow.reason,
  };
}

export function toTimelineEvents(
  events: readonly WorkspaceTimelineEvent[],
): readonly TimelineEvent[] {
  return events.map((event) => ({
    eventId: event.eventId,
    occurredAt: event.occurredAt,
    description: event.description,
  }));
}

function noteToKnowledge(note: ResearchNote): Knowledge {
  return { knowledgeId: note.noteId, body: note.body, createdAt: note.createdAt };
}

function findingToKnowledge(finding: ResearchFinding): Knowledge {
  return { knowledgeId: finding.findingId, body: finding.summary, createdAt: finding.createdAt };
}

export function toKnowledge(workspace: ResearchReviewWorkspaceState): readonly Knowledge[] {
  return [
    ...workspace.notes.map(noteToKnowledge),
    ...workspace.findings.map(findingToKnowledge),
  ];
}

/**
 * Assemble the full Intelligence Foundation view for a research topic. Composes every existing
 * engine's output through the adapters above — the only "logic" in this function is
 * composition and undefined-guarding, matching the required
 * Foundation → Intelligence Engines → Workspace → Experience layering.
 */
export function buildResearchFoundationView(
  topicId: string,
): IntelligenceFoundationView | undefined {
  const evidenceReview = buildTopicEvidenceReview(topicId);
  const intelligence = deriveEvidenceGapIntelligence(topicId);
  const workflow = deriveResearchWorkflow(topicId);
  const workspace = buildResearchReviewWorkspace(topicId);
  if (!evidenceReview || !intelligence || !workflow || !workspace) {
    return undefined;
  }

  const timeline = getWorkspaceTimeline(topicId);

  return {
    subject: toSubject(intelligence.topic),
    mission: toMission(intelligence.topic),
    questions: workspace.openQuestions,
    evidence: evidenceReview.evidenceItems.map(toEvidence),
    relationships: toRelationships(intelligence.topic),
    analysis: toAnalysis(intelligence),
    recommendation: toRecommendation(workflow),
    executionHref: workflow.actionLink?.href,
    timeline: toTimelineEvents(timeline),
    knowledge: toKnowledge(workspace),
  };
}
