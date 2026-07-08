import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getLaboratoryReadinessForTopic,
  LABORATORY_TOPIC_NOT_CONNECTED_MESSAGE,
} from "@/lib/research/laboratories";
import LaboratoryReadiness from "@/components/research/laboratories/LaboratoryReadiness";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type LaboratoryEvidenceTypesProps = {
  topic: ResearchTopic;
};

export default function LaboratoryEvidenceTypes({ topic }: LaboratoryEvidenceTypesProps) {
  const readiness = getLaboratoryReadinessForTopic(topic);
  const { layer, isTopicSpecific, hasLaboratoryEvidenceType } = readiness;

  if (!layer) {
    return (
      <div className={`${cbaiGlassCard} p-4`}>
        <p className="text-sm text-zinc-400">{LABORATORY_TOPIC_NOT_CONNECTED_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Topic laboratory readiness</p>
        <h3 className="text-base font-semibold text-zinc-100">{topic.topicName}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {LABORATORY_TOPIC_NOT_CONNECTED_MESSAGE} Readiness profile below describes future
          integration — no live laboratory data exists for this topic.
        </p>
      </div>

      {hasLaboratoryEvidenceType ? (
        <div className={`${cbaiGlassCard} space-y-3 p-4`}>
          <p className="text-xs text-zinc-400">
            This topic lists laboratory-related evidence types that will require lab profile metadata
            when sources connect.
            {isTopicSpecific ? " Topic-specific readiness profile available." : null}
          </p>
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
          Generic laboratory readiness applies — no topic-specific laboratory layer configured
          yet.
        </p>
      )}

      <LaboratoryReadiness layer={layer} />
    </div>
  );
}
