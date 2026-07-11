import type { ResearchTopic } from "@/lib/research/research-topics";
import { deriveResearchReadiness } from "@/lib/research/readiness/readiness-engine";
import { RESEARCH_READINESS_LABELS } from "@/lib/research/intelligence/intelligence-types";
import { RESEARCH_DECISION_LABELS } from "@/lib/research/intelligence/decision-types";
import { getWorkspaceMemory } from "@/lib/research/intelligence/workspace-shell-engine";
import { buildMissionStatement } from "@/components/research/topic/ResearchMissionWorkspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type MissionControlPanelProps = {
  topic: ResearchTopic;
};

// Single-glance summary consolidating what previously lived in a standalone Decision Card
// plus a separate "current state" card. All readiness-related fields (stage, blocking issues,
// next action, reasons) come from exactly one deriveResearchReadiness() call — no separate
// derivation lives in this component. Workspace memory is a distinct, unrelated concern (session
// continuity, not readiness) and is read separately.
export default function MissionControlPanel({ topic }: MissionControlPanelProps) {
  const readiness = deriveResearchReadiness(topic.topicId);
  const memory = getWorkspaceMemory(topic.topicId);

  if (!readiness) {
    return null;
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>Mission control</p>
          <p className="mt-1 text-sm text-zinc-200">{buildMissionStatement(topic)}</p>
        </div>
        <span className="inline-flex shrink-0 rounded-md border border-cyan-500/25 bg-cyan-500/5 px-2 py-0.5 text-xs font-medium text-cyan-300">
          {RESEARCH_READINESS_LABELS[readiness.stage]}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Blocking issues
          </p>
          {readiness.blockingIssues.length > 0 ? (
            <ul className="mt-1.5 space-y-1">
              {readiness.blockingIssues.map((item) => (
                <li key={item.evidenceItemId} className="text-xs text-zinc-500">
                  {item.label} — {item.note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-600">No blocking issues detected.</p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Next recommended action
          </p>
          <p className="mt-1.5 text-sm font-medium text-zinc-200">
            {RESEARCH_DECISION_LABELS[readiness.recommendedNextAction]}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Why</p>
        <ul className="mt-1.5 space-y-1">
          {readiness.reasons.map((reason) => (
            <li key={reason} className="text-xs text-zinc-500">
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-600">
        {memory
          ? `Continue where you left off — last visited stage: ${RESEARCH_READINESS_LABELS[memory.lastStage]}.`
          : "No previous session recorded yet."}
      </p>
    </div>
  );
}
