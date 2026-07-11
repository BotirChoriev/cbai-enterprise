import { Suspense } from "react";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import { buildResearchReviewWorkspace } from "@/lib/research/intelligence/review-workspace-engine";
import { getWorkspaceTimeline } from "@/lib/research/intelligence/workspace-shell-engine";
import { WORKSPACE_TIMELINE_EVENT_LABELS } from "@/lib/research/intelligence/workspace-shell-model";
import { RESEARCH_DECISION_LABELS } from "@/lib/research/intelligence/decision-types";
import { deriveResearchReadiness } from "@/lib/research/readiness/readiness-engine";
import ResearchMissionWorkspace from "@/components/research/topic/ResearchMissionWorkspace";
import TopicEvidenceReviewWorkflow from "@/components/research/topic/TopicEvidenceReviewWorkflow";
import TopicEvidenceSelection from "@/components/research/topic/TopicEvidenceSelection";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type TopicReviewWorkspaceProps = {
  topic: ResearchTopic;
};

// Server-rendered orchestrator: composes the existing Mission Workspace and Evidence
// Selection/Workflow (unchanged) with new, honestly-derived Current State / Notes / Findings /
// Open Questions / Continue Review sections into one connected review flow. No new client
// boundary here — TopicEvidenceSelection already owns the one useSearchParams() call needed
// for URL-driven evidence selection, tightly Suspense-scoped exactly as before.
export default function TopicReviewWorkspace({ topic }: TopicReviewWorkspaceProps) {
  const evidenceReview = buildTopicEvidenceReview(topic.topicId);
  const workspace = buildResearchReviewWorkspace(topic.topicId);
  const timeline = getWorkspaceTimeline(topic.topicId);
  const readiness = deriveResearchReadiness(topic.topicId);

  if (!evidenceReview || !workspace || !readiness) {
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Research notes</p>
          {workspace.notes.length > 0 ? (
            <ul className="space-y-1.5">
              {workspace.notes.map((note) => (
                <li key={note.noteId} className="text-xs text-zinc-500">
                  {note.body}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">No notes yet.</p>
          )}
        </div>

        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className={cbaiSectionEyebrow}>Findings</p>
          {workspace.findings.length > 0 ? (
            <ul className="space-y-1.5">
              {workspace.findings.map((finding) => (
                <li key={finding.findingId} className="text-xs text-zinc-500">
                  {finding.summary}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-600">No findings yet.</p>
          )}
        </div>
      </div>

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
        <p className={cbaiSectionEyebrow}>Workspace timeline</p>
        {timeline.length > 0 ? (
          <ol className="space-y-1.5">
            {timeline.map((event) => (
              <li key={event.eventId} className="flex items-start gap-2 text-xs text-zinc-500">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <span>
                  <span className="text-zinc-400">
                    {WORKSPACE_TIMELINE_EVENT_LABELS[event.eventType]}
                  </span>{" "}
                  — {event.description}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-zinc-600">No workspace activity recorded yet.</p>
        )}
      </div>

      <div className={`${cbaiGlassCard} flex flex-wrap items-center justify-between gap-3 p-4`}>
        <div>
          <p className={cbaiSectionEyebrow}>Continue review</p>
          <p className="mt-1 text-sm font-medium text-zinc-200">
            {RESEARCH_DECISION_LABELS[workspace.decision]}
          </p>
        </div>
        <p className="max-w-sm text-xs text-zinc-500">
          The next step to continue this topic&apos;s research review.
        </p>
      </div>
    </section>
  );
}
