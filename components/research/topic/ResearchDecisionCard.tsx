import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_DECISION_LABELS, type ResearchDecision } from "@/lib/research/intelligence/decision-types";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchDecisionCardProps = {
  topic: ResearchTopic;
  decision: ResearchDecision;
};

export default function ResearchDecisionCard({ topic, decision }: ResearchDecisionCardProps) {
  return (
    <div className={`${cbaiGlassCard} flex flex-wrap items-center justify-between gap-3 p-4`}>
      <div>
        <p className={cbaiSectionEyebrow}>Next decision</p>
        <p className="mt-1 text-lg font-semibold text-zinc-100">
          {RESEARCH_DECISION_LABELS[decision]}
        </p>
      </div>
      <p className="max-w-sm text-xs text-zinc-500">
        The one recommended next step for {topic.topicName}, derived from current evidence and
        review state.
      </p>
    </div>
  );
}
