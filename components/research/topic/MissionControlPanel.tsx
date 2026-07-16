import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { deriveResearchWorkflow } from "@/lib/research/workflow/workflow-engine";
import type { WorkflowStage } from "@/lib/research/workflow/workflow-types";
import { WORKFLOW_NEXT_ACTION_LABELS, WORKFLOW_STAGE_LABELS } from "@/lib/research/workflow/workflow-types";
import { RESEARCH_READINESS_LABELS } from "@/lib/research/intelligence/intelligence-types";
import { getWorkspaceMemory } from "@/lib/research/intelligence/workspace-shell-engine";
import { buildMissionStatement } from "@/components/research/topic/ResearchMissionWorkspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function stageAccent(stage: WorkflowStage): string {
  switch (stage) {
    case "evidence_connection_required":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
    case "evidence_ready_for_review":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "review_required":
      return "border-amber-600/30 bg-amber-600/10 text-amber-500";
    case "monitoring_required":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
    case "unknown":
      return "border-zinc-700 bg-zinc-900/40 text-zinc-400";
  }
}

type MissionControlPanelProps = {
  topic: ResearchTopic;
};

// Single-glance summary, organized into action: current stage, next action (a real link when
// one exists, an honest non-interactive requirement otherwise), why, and what blocks it — all
// from exactly one deriveResearchWorkflow() call, which itself consumes only the Health Engine.
// No separate call to the Health, Readiness, Gap, or Decision engines lives in this component.
// Workspace memory is a distinct, unrelated concern (session continuity) and is read separately.
export default function MissionControlPanel({ topic }: MissionControlPanelProps) {
  const workflow = deriveResearchWorkflow(topic.topicId);
  const memory = getWorkspaceMemory(topic.topicId);

  if (!workflow) {
    return null;
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>Mission control</p>
          <p className="mt-1 text-sm text-zinc-200">{buildMissionStatement(topic)}</p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${stageAccent(workflow.currentStage)}`}
        >
          {WORKFLOW_STAGE_LABELS[workflow.currentStage]}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Blocked by
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

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Next action
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
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Why</p>
        <p className="mt-1.5 text-xs text-zinc-500">{workflow.reason}</p>
      </div>

      <p className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
        {memory
          ? `Continue where you left off — last visited stage: ${RESEARCH_READINESS_LABELS[memory.lastStage]}.`
          : "No previous session recorded yet."}
      </p>
    </div>
  );
}
