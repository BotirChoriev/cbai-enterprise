import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import type {
  TopicEvidenceCatalogItem,
  TopicEvidenceCatalogStatus,
} from "@/lib/research/evidence/evidence-topic-builder";
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
  Question,
  Recommendation,
  Relationship,
  Subject,
  TimelineEvent,
} from "@/lib/foundation/foundation-model";
import type { IntelligenceFoundationView } from "@/lib/foundation/foundation-view";
import { buildRelationship } from "@/lib/relationships/relationship-builder";
import { buildEvidence } from "@/lib/evidence/evidence-builder";
import type { VerificationStatus } from "@/lib/foundation/evidence-types";
import type { ReasoningResult } from "@/lib/foundation/reasoning-types";
import { buildReasoningResult } from "@/lib/reasoning/reasoning-engine";
import type { Workflow } from "@/lib/foundation/workflow-types";
import { createWorkflow } from "@/lib/workflow/workflow-builder";
import type { IntelligenceResult } from "@/lib/foundation/orchestration-types";
import type { IntelligencePipelineProviders } from "@/lib/orchestration/pipeline-types";
import { runIntelligencePipeline } from "@/lib/orchestration/pipeline-engine";

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

/**
 * The catalog only tracks a coarse connection status, not a real verification workflow — so
 * the mapping below is deliberately narrow: it never claims "verified", only what the catalog
 * status honestly implies about where the item stands.
 */
const CATALOG_STATUS_TO_VERIFICATION_STATUS: Record<
  TopicEvidenceCatalogStatus,
  VerificationStatus
> = {
  catalog_available: "not_started",
  source_not_connected: "not_applicable",
  human_review_required: "verification_pending",
};

export function toEvidence(item: TopicEvidenceCatalogItem): Evidence {
  return buildEvidence({
    evidenceId: item.evidenceItemId,
    label: item.label,
    status: item.status,
    note: item.note,
    verificationStatus: CATALOG_STATUS_TO_VERIFICATION_STATUS[item.status],
    relatedSubjectIds: [item.topicId],
  });
}

/**
 * Relationships from a topic's own catalog fields — the honestly-detectable connections
 * already present in ResearchTopic, not the separate lib/research/entities registry (a
 * broader, not-yet-topic-integrated catalog left as a future foundation integration point).
 * Built through the universal relationship engine (lib/relationships/) rather than
 * constructing Relationship objects by hand, so confidence/limitations stay consistent with
 * every other ecosystem that will use the same builder.
 */
export function toRelationships(topic: ResearchTopic): readonly Relationship[] {
  const methodRelationships = topic.relatedMethods.map((method) =>
    buildRelationship({
      sourceId: topic.topicId,
      targetId: method,
      relationshipType: "uses",
      explanation: `${topic.topicName} uses the method "${method}" per the research catalog.`,
      source: "catalog",
    }),
  );

  const evidenceTypeRelationships = topic.relatedEvidenceTypes.map((evidenceType) =>
    buildRelationship({
      sourceId: topic.topicId,
      targetId: evidenceType,
      relationshipType: "depends_on",
      explanation: `${topic.topicName} depends on the evidence category "${evidenceType}" per the research catalog.`,
      source: "catalog",
    }),
  );

  return [...methodRelationships, ...evidenceTypeRelationships];
}

export function toAnalysis(intelligence: EvidenceGapIntelligence): Analysis {
  return {
    subjectId: intelligence.topic.topicId,
    summary: `${intelligence.connectedEvidence.length} live-connected, ${intelligence.catalogDocumentedEvidence.length} catalog-documented, ${intelligence.disconnectedEvidence.length} disconnected, ${intelligence.reviewGatedEvidence.length} review-gated.`,
    reasons: intelligence.catalogDocumentedEvidence
      .concat(intelligence.disconnectedEvidence)
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
 * The question this reasoning pass answers — the topic's first real open question when one
 * exists, otherwise a question mechanically composed from the topic's own name (same pattern
 * as toMission: real data reworded into a sentence, never an invented claim).
 */
function toReasoningQuestion(
  topic: ResearchTopic,
  openQuestions: IntelligenceFoundationView["questions"],
): Question {
  return (
    openQuestions[0] ?? {
      questionId: `${topic.topicId}:reasoning-question`,
      question: `What can be honestly concluded about ${topic.topicName} from the evidence currently connected?`,
    }
  );
}

/**
 * Run the universal Reasoning Framework (lib/reasoning/) over a topic's own Foundation
 * evidence, relationships, and timeline. Pure composition — the framework itself is entirely
 * domain-agnostic and contains no Research-specific logic.
 */
export function toReasoningResult(
  topic: ResearchTopic,
  question: Question,
  mission: Mission,
  evidence: readonly Evidence[],
  relationships: readonly Relationship[],
  timeline: readonly TimelineEvent[],
): ReasoningResult {
  return buildReasoningResult({
    subjectId: topic.topicId,
    question,
    mission,
    evidence,
    relationships,
    timeline,
  });
}

/**
 * Compose the universal Intelligence Workflow (lib/workflow/) around a topic's own Foundation
 * objects. This demonstrates the framework can carry a topic's full Question/Mission/Evidence/
 * Relationships/Reasoning composition — it deliberately does not synthesize a fake transition
 * history from the pre-existing Research Workflow Engine's point-in-time stage signal
 * (`WorkflowResult.currentStage`): inventing an actor, timestamp, and reason for transitions
 * that were never actually recorded would fabricate provenance. Every research topic's demo
 * Workflow honestly starts at "not_started" with empty history; a real caller applies real
 * transitions via applyWorkflowTransition as work actually happens.
 */
export function toWorkflow(
  topic: ResearchTopic,
  question: Question,
  mission: Mission,
  evidence: readonly Evidence[],
  relationships: readonly Relationship[],
  reasoning: ReasoningResult,
): Workflow {
  return createWorkflow({
    workflowId: `workflow:${topic.topicId}`,
    subjectId: topic.topicId,
    question,
    mission,
    evidence,
    relationships,
    reasoning,
  });
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
  const workflowResult = deriveResearchWorkflow(topicId);
  const workspace = buildResearchReviewWorkspace(topicId);
  if (!evidenceReview || !intelligence || !workflowResult || !workspace) {
    return undefined;
  }

  const timeline = getWorkspaceTimeline(topicId);
  const mission = toMission(intelligence.topic);
  const evidence = evidenceReview.evidenceItems.map(toEvidence);
  const relationships = toRelationships(intelligence.topic);
  const timelineEvents = toTimelineEvents(timeline);
  const question = toReasoningQuestion(intelligence.topic, workspace.openQuestions);
  const reasoning = toReasoningResult(
    intelligence.topic,
    question,
    mission,
    evidence,
    relationships,
    timelineEvents,
  );

  return {
    subject: toSubject(intelligence.topic),
    mission,
    questions: workspace.openQuestions,
    evidence,
    relationships,
    analysis: toAnalysis(intelligence),
    recommendation: toRecommendation(workflowResult),
    executionHref: workflowResult.actionLink?.href,
    timeline: timelineEvents,
    knowledge: toKnowledge(workspace),
    reasoning,
    workflow: toWorkflow(intelligence.topic, question, mission, evidence, relationships, reasoning),
  };
}

/**
 * Research Intelligence's plugin into the universal Orchestration Layer (lib/orchestration/).
 * Every function here is a thin wrapper around the adapters already defined above — no
 * evidence, relationship, reasoning, or workflow logic is re-derived; this object only tells
 * the domain-agnostic pipeline engine where to find Research's real data.
 */
const researchIntelligencePipelineProviders: IntelligencePipelineProviders = {
  resolveFoundation: (input) => {
    const topic = getResearchTopicById(input.subjectId);
    if (!topic) {
      return undefined;
    }
    return { subject: toSubject(topic), mission: toMission(topic) };
  },
  discoverEvidence: (foundation) => {
    const evidenceReview = buildTopicEvidenceReview(foundation.subject.subjectId);
    return evidenceReview ? evidenceReview.evidenceItems.map(toEvidence) : [];
  },
  resolveRelationships: (foundation) => {
    const topic = getResearchTopicById(foundation.subject.subjectId);
    return topic ? toRelationships(topic) : [];
  },
};

/**
 * Run the universal Intelligence Orchestration pipeline (lib/orchestration/) for a research
 * topic. Proves the domain-agnostic pipeline engine is compatible with Research Intelligence's
 * real data without duplicating any of the logic buildResearchFoundationView already composes.
 */
export function runResearchIntelligencePipeline(
  topicId: string,
  question?: Question,
): IntelligenceResult | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }

  const workspace = buildResearchReviewWorkspace(topicId);
  const resolvedQuestion = question ?? toReasoningQuestion(topic, workspace?.openQuestions ?? []);

  return runIntelligencePipeline(researchIntelligencePipelineProviders, {
    subjectId: topicId,
    question: resolvedQuestion,
  });
}
