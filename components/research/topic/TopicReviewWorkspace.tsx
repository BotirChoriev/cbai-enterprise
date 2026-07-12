import { Suspense } from "react";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import { buildResearchReviewWorkspace } from "@/lib/research/intelligence/review-workspace-engine";
import { deriveResearchReadiness } from "@/lib/research/readiness/readiness-engine";
import type { WorkflowResult } from "@/lib/research/workflow/workflow-model";
import { buildEntityRelationships } from "@/lib/entity/entity-relationships";
import ResearchMissionWorkspace from "@/components/research/topic/ResearchMissionWorkspace";
import TopicEvidenceReviewWorkflow from "@/components/research/topic/TopicEvidenceReviewWorkflow";
import TopicEvidenceSelection from "@/components/research/topic/TopicEvidenceSelection";
import ResearchNotesPanel from "@/components/research/topic/ResearchNotesPanel";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type TopicReviewWorkspaceProps = {
  topic: ResearchTopic;
  workflow: WorkflowResult | undefined;
};

// Server-rendered orchestrator: composes the existing Mission Workspace and Evidence
// Selection/Workflow (unchanged) with new, honestly-derived Current State / Notes / Findings /
// Open Questions sections into one connected review flow. No new client boundary here —
// TopicEvidenceSelection already owns the one useSearchParams() call needed for URL-driven
// evidence selection, tightly Suspense-scoped exactly as before. `workflow` is derived once by
// the parent and shared with ResearchCockpit, which already surfaces the recommended next
// action — this component only adds the actions that are still unavailable.
export default function TopicReviewWorkspace({ topic, workflow }: TopicReviewWorkspaceProps) {
  const evidenceReview = buildTopicEvidenceReview(topic.topicId);
  const workspace = buildResearchReviewWorkspace(topic.topicId);
  const readiness = deriveResearchReadiness(topic.topicId);

  if (!evidenceReview || !workspace || !readiness || !workflow) {
    return null;
  }

  return (
    <section aria-labelledby="topic-review-workspace-heading" className="space-y-6">
      <div>
        <p className={cbaiSectionEyebrow}>Research review workspace</p>
        <h2 id="topic-review-workspace-heading" className="text-xl font-semibold text-zinc-100">
          Review {topic.topicName}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Mission, current state, evidence, notes, findings, and open questions in one flow —
          derived only from current platform state.
        </p>
      </div>

      <ResearchMissionWorkspace review={evidenceReview} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Completed milestones</p>
          {readiness.completedMilestones.length > 0 ? (
            <ul className="space-y-1.5">
              {readiness.completedMilestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className="flex items-start gap-2 text-xs text-zinc-400"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
                  {milestone.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">No milestones completed yet.</p>
          )}
        </div>

        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Remaining milestones</p>
          {readiness.remainingMilestones.length > 0 ? (
            <ul className="space-y-1.5">
              {readiness.remainingMilestones.map((milestone) => (
                <li
                  key={milestone.id}
                  className="flex items-start gap-2 text-xs text-zinc-500"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                  {milestone.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">All tracked milestones are complete.</p>
          )}
        </div>
      </div>

      <Suspense
        fallback={
          <TopicEvidenceReviewWorkflow
            review={evidenceReview}
            selectedEvidence={evidenceReview.selectedEvidence}
          />
        }
      >
        <TopicEvidenceSelection review={evidenceReview} />
      </Suspense>

      <ResearchNotesPanel
        topicId={topic.topicId}
        evidenceItems={evidenceReview.evidenceItems}
        relatedEntities={buildEntityRelationships("research_topic", topic.topicId)}
      />

      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Open review questions</p>
        {workspace.openQuestions.length > 0 ? (
          <ul className="space-y-1.5">
            {workspace.openQuestions.map((question) => (
              <li
                key={question.questionId}
                className="flex items-start gap-2 text-xs text-zinc-500"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500/60" />
                {question.question}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-600">No open review questions right now.</p>
        )}
      </div>

      <div className={`${cbaiGlassCard} space-y-2 p-4`}>
        <p className={cbaiSectionEyebrow}>Not yet available</p>
        <ul className="space-y-1.5">
          {workflow.unavailableActions.map((unavailable) => (
            <li key={unavailable.action} className="text-xs text-zinc-500">
              <span className="text-zinc-400">{unavailable.action}</span> — {unavailable.reason}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
