import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  EXPERIMENT_TOPIC_NOT_CONNECTED_MESSAGE,
  getExperimentReadinessForTopic,
} from "@/lib/research/experiments";
import ExperimentReadiness from "@/components/research/experiments/ExperimentReadiness";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ExperimentEvidenceTypesProps = {
  topic: ResearchTopic;
};

export default function ExperimentEvidenceTypes({ topic }: ExperimentEvidenceTypesProps) {
  const readiness = getExperimentReadinessForTopic(topic);
  const { layer, isTopicSpecific, hasExperimentEvidenceType } = readiness;

  if (!layer) {
    return (
      <div className={`${cbaiGlassCard} p-4`}>
        <p className="text-sm text-zinc-400">{EXPERIMENT_TOPIC_NOT_CONNECTED_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Topic experiment readiness</p>
        <h3 className="text-base font-semibold text-zinc-100">{topic.topicName}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {EXPERIMENT_TOPIC_NOT_CONNECTED_MESSAGE} Readiness profile below describes future
          integration — no live experiment data exists for this topic.
        </p>
      </div>

      {hasExperimentEvidenceType ? (
        <div className={`${cbaiGlassCard} space-y-3 p-4`}>
          <p className="text-xs text-zinc-400">
            This topic references methods or evidence types that will require experiment metadata
            when sources connect.
            {isTopicSpecific ? " Topic-specific readiness profile available." : null}
          </p>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Related methods
            </p>
            <p className="mt-1 text-xs text-zinc-500">{topic.relatedMethods.join(" · ")}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Related evidence types
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {topic.relatedEvidenceTypes.join(" · ")}
            </p>
          </div>
        </div>
      ) : (
        <p className={`${cbaiGlassCard} px-4 py-3 text-xs text-zinc-500`}>
          Generic experiment readiness applies — no topic-specific experiment layer configured
          yet.
        </p>
      )}

      <ExperimentReadiness layer={layer} />
    </div>
  );
}
