import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { deriveResearchDecision } from "@/lib/research/intelligence/decision-engine";
import {
  loadResearchFindings,
  loadResearchNotes,
} from "@/lib/research/research-workspace-store";
import type { EvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-model";
import type {
  ResearchReviewWorkspaceState,
  ReviewOpenQuestion,
  ReviewProgress,
} from "@/lib/research/intelligence/review-workspace-model";

function buildOpenQuestions(intelligence: EvidenceGapIntelligence): readonly ReviewOpenQuestion[] {
  const questions: ReviewOpenQuestion[] = [];

  for (const item of intelligence.catalogDocumentedEvidence) {
    questions.push({
      questionId: `question:${item.evidenceItemId}:catalog`,
      question: `Has a live source been connected for catalog category ${item.label}?`,
    });
  }

  for (const item of intelligence.disconnectedEvidence) {
    questions.push({
      questionId: `question:${item.evidenceItemId}:source`,
      question: `Has a source been connected for ${item.label} yet?`,
    });
  }

  for (const item of intelligence.reviewGatedEvidence) {
    questions.push({
      questionId: `question:${item.evidenceItemId}:review`,
      question: `Has ${item.label} completed the human review it requires?`,
    });
  }

  if (!intelligence.reviewStatus.reviewOpened) {
    questions.push({
      questionId: `question:${intelligence.topic.topicId}:review-opened`,
      question: `Has a research review been opened for ${intelligence.topic.topicName} yet?`,
    });
  }

  return questions;
}

function buildProgress(intelligence: EvidenceGapIntelligence): ReviewProgress {
  return {
    connectedCount: intelligence.connectedEvidence.length,
    totalCount:
      intelligence.catalogDocumentedEvidence.length +
      intelligence.connectedEvidence.length +
      intelligence.disconnectedEvidence.length +
      intelligence.reviewGatedEvidence.length,
    readiness: intelligence.researchReadiness,
  };
}

/**
 * Assemble the deterministic Research Review Workspace state for a topic. Reuses the Evidence
 * Gap Intelligence Engine and Research Decision Engine rather than re-deriving readiness or
 * evidence status. Notes and findings have no persistence anywhere in this platform yet, so
 * they are always empty — the honest empty state is rendered by the UI, not invented here.
 * Open questions are derived only from real disconnected/gated evidence and review state,
 * never as scientific questions.
 */
export function buildResearchReviewWorkspace(
  topicId: string,
): ResearchReviewWorkspaceState | undefined {
  const intelligence = deriveEvidenceGapIntelligence(topicId);
  const decision = deriveResearchDecision(topicId);
  if (!intelligence || !decision) {
    return undefined;
  }

  return {
    topic: intelligence.topic,
    intelligence,
    decision,
    openQuestions: buildOpenQuestions(intelligence),
    notes: loadResearchNotes(topicId).map((note) => ({
      noteId: note.noteId,
      topicId: note.topicId,
      body: note.body,
      createdAt: note.createdAt,
    })),
    findings: loadResearchFindings(topicId).map((finding) => ({
      findingId: finding.findingId,
      topicId: finding.topicId,
      summary: finding.summary,
      createdAt: finding.createdAt,
    })),
    progress: buildProgress(intelligence),
  };
}
