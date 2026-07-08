import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getPublicationReadinessForTopic,
  PUBLICATION_TOPIC_NOT_CONNECTED_MESSAGE,
} from "@/lib/research/publications";
import PublicationSourceReadiness from "@/components/research/publications/PublicationSourceReadiness";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type PublicationTopicPreviewProps = {
  topic: ResearchTopic;
};

export default function PublicationTopicPreview({ topic }: PublicationTopicPreviewProps) {
  const readiness = getPublicationReadinessForTopic(topic);
  const { layer, isTopicSpecific, hasPublicationEvidenceType } = readiness;

  if (!layer) {
    return (
      <div className={`${cbaiGlassCard} p-4`}>
        <p className="text-sm text-zinc-400">{PUBLICATION_TOPIC_NOT_CONNECTED_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Topic publication readiness</p>
        <h3 className="text-base font-semibold text-zinc-100">{topic.topicName}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {PUBLICATION_TOPIC_NOT_CONNECTED_MESSAGE} Readiness profile below describes future
          integration — no live publication data exists for this topic.
        </p>
      </div>

      {hasPublicationEvidenceType ? (
        <p className={`${cbaiGlassCard} px-4 py-3 text-xs text-zinc-400`}>
          This topic lists research literature in its catalog evidence types. Publication metadata
          will be required when sources connect.
          {isTopicSpecific ? " Topic-specific readiness profile available." : null}
        </p>
      ) : (
        <p className={`${cbaiGlassCard} px-4 py-3 text-xs text-zinc-500`}>
          Generic publication readiness applies — no topic-specific publication layer configured
          yet.
        </p>
      )}

      <PublicationSourceReadiness layer={layer} />
    </div>
  );
}
