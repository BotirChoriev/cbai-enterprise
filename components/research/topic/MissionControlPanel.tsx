import type { ResearchTopic } from "@/lib/research/research-topics";
import { deriveResearchHealth } from "@/lib/research/health/health-engine";
import type { ResearchHealthState } from "@/lib/research/health/health-types";
import { RESEARCH_HEALTH_LABELS } from "@/lib/research/health/health-types";
import { RESEARCH_READINESS_LABELS } from "@/lib/research/intelligence/intelligence-types";
import { RESEARCH_DECISION_LABELS } from "@/lib/research/intelligence/decision-types";
import { getWorkspaceMemory } from "@/lib/research/intelligence/workspace-shell-engine";
import { buildMissionStatement } from "@/components/research/topic/ResearchMissionWorkspace";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function healthAccent(state: ResearchHealthState): string {
  switch (state) {
    case "healthy":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-300";
    case "stable":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "weak":
      return "border-amber-500/25 bg-amber-500/5 text-amber-300";
    case "critical":
      return "border-rose-500/25 bg-rose-500/5 text-rose-300";
  }
}

type MissionControlPanelProps = {
  topic: ResearchTopic;
};

// Single-glance summary. Every readiness/health/decision field (stage, health state, blocking
// factors, next action, reasons) comes from exactly one deriveResearchHealth() call — no
// separate call to the Readiness, Gap, or Decision engines lives in this component. Workspace
// memory is a distinct, unrelated concern (session continuity, not health) and is read separately.
export default function MissionControlPanel({ topic }: MissionControlPanelProps) {
  const health = deriveResearchHealth(topic.topicId);
  const memory = getWorkspaceMemory(topic.topicId);

  if (!health) {
    return null;
  }

  return (
    <div className={`${cbaiGlassCard} space-y-4 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cbaiSectionEyebrow}>Mission control</p>
          <p className="mt-1 text-sm text-zinc-200">{buildMissionStatement(topic)}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Stage: {RESEARCH_READINESS_LABELS[health.stage]}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${healthAccent(health.state)}`}
        >
          {RESEARCH_HEALTH_LABELS[health.state]}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Blocking factors
          </p>
          {health.blockingFactors.length > 0 ? (
            <ul className="mt-1.5 space-y-1">
              {health.blockingFactors.map((item) => (
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
            Next recommended action
          </p>
          <p className="mt-1.5 text-sm font-medium text-zinc-200">
            {RESEARCH_DECISION_LABELS[health.recommendedNextAction]}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Why</p>
        <ul className="mt-1.5 space-y-1">
          {health.reasons.map((reason) => (
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
