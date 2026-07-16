import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import type { WorkflowResult } from "@/lib/research/workflow/workflow-model";
import { WORKFLOW_NEXT_ACTION_LABELS, WORKFLOW_STAGE_LABELS } from "@/lib/research/workflow/workflow-types";
import { deriveResearchHealth } from "@/lib/research/health/health-engine";
import { RESEARCH_HEALTH_LABELS } from "@/lib/research/health/health-types";
import { RESEARCH_READINESS_LABELS } from "@/lib/research/intelligence/intelligence-types";
import {
  getWorkspaceMemory,
  getWorkspaceTimeline,
} from "@/lib/research/intelligence/workspace-shell-engine";
import { WORKSPACE_TIMELINE_EVENT_LABELS } from "@/lib/research/intelligence/workspace-shell-model";
import { buildMissionStatement } from "@/components/research/topic/ResearchMissionWorkspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchCockpitProps = {
  topic: ResearchTopic;
  workflow: WorkflowResult | undefined;
};

// The operational center of a research mission. Purely presentational — every field is read
// from the Workflow and Health engines (which already compose Readiness, Gap, Decision, and
// Review Workspace beneath them); nothing is calculated here. Replaces MissionControlPanel
// and the Workspace Timeline section that previously lived inside TopicReviewWorkspace, so
// "current situation" is answered in one place instead of two. `workflow` is derived once by
// the parent and shared with TopicReviewWorkspace so both cards never disagree.
export default function ResearchCockpit({ topic, workflow }: ResearchCockpitProps) {
  const health = deriveResearchHealth(topic.topicId);
  const timeline = getWorkspaceTimeline(topic.topicId);
  const memory = getWorkspaceMemory(topic.topicId);

  if (!workflow || !health) {
    return null;
  }

  return (
    <div className={`${cbaiGlassCard} space-y-5 p-4 sm:p-5`}>
      <div className="space-y-3">
        <div>
          <p className={cbaiSectionEyebrow}>Research cockpit</p>
          <p className="mt-1 text-sm text-zinc-200">{buildMissionStatement(topic)}</p>
        </div>

        <dl className="flex flex-wrap gap-2">
          <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
            <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              Current stage
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-zinc-200">
              {WORKFLOW_STAGE_LABELS[workflow.currentStage]}
            </dd>
          </div>
          <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
            <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              Research readiness
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-zinc-200">
              {RESEARCH_READINESS_LABELS[health.stage]}
            </dd>
          </div>
          <div className="rounded-md border border-zinc-800/80 bg-slate-950/50 px-2.5 py-1">
            <dt className="text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              Research health
            </dt>
            <dd className="mt-0.5 text-xs font-medium text-zinc-200">
              {RESEARCH_HEALTH_LABELS[health.state]}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Current workflow
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{workflow.reason}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Blocking factors
            </p>
            {workflow.blockingFactors.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {workflow.blockingFactors.map((item) => (
                  <li key={item.evidenceItemId} className="text-xs text-zinc-500">
                    {item.label} — {item.note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">No blocking factors detected.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Recommended next action
            </p>
            {workflow.actionLink ? (
              <Link
                href={workflow.actionLink.href}
                className="mt-1.5 inline-flex rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-300 transition-colors hover:border-teal-500/50 hover:bg-teal-500/15"
              >
                {workflow.actionLink.label} →
              </Link>
            ) : (
              <>
                <p className="mt-1.5 text-sm font-medium text-zinc-200">
                  {WORKFLOW_NEXT_ACTION_LABELS[workflow.nextAction]}
                </p>
                {workflow.advancementRequirements.map((requirement) => (
                  <p key={requirement} className="mt-1 text-xs text-zinc-600">
                    {requirement}
                  </p>
                ))}
              </>
            )}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Latest research activity
            </p>
            {timeline.length > 0 ? (
              <ol className="mt-1.5 space-y-1">
                {timeline.map((event) => (
                  <li key={event.eventId} className="text-xs text-zinc-500">
                    <span className="text-zinc-400">
                      {WORKSPACE_TIMELINE_EVENT_LABELS[event.eventType]}
                    </span>{" "}
                    — {event.description}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-600">No workspace activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <p className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
        {memory
          ? `Continue where you left off — last visited stage: ${RESEARCH_READINESS_LABELS[memory.lastStage]}.`
          : "No previous session recorded yet."}
      </p>
    </div>
  );
}
