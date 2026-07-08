import type { CrossTopicDiscovery } from "@/lib/research/discovery/discovery-types";
import type { ResearchTopic } from "@/lib/research/research-topics";
import DiscoveryReasonBadge from "@/components/research/discovery/DiscoveryReasonBadge";

type DiscoveryPathProps = {
  sourceTopic: ResearchTopic;
  relatedTopic: ResearchTopic;
  discovery: CrossTopicDiscovery;
  compact?: boolean;
};

export default function DiscoveryPath({
  sourceTopic,
  relatedTopic,
  discovery,
  compact = false,
}: DiscoveryPathProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "text-[10px]" : "text-xs"}`}>
      <span className="font-medium text-zinc-400">{sourceTopic.topicName}</span>
      <span className="text-zinc-700" aria-hidden="true">
        →
      </span>
      <div className="flex flex-wrap gap-1">
        {discovery.relationshipReasons.map((reason) => (
          <DiscoveryReasonBadge key={reason} reason={reason} />
        ))}
      </div>
      <span className="text-zinc-700" aria-hidden="true">
        →
      </span>
      <span className="font-medium text-zinc-200">{relatedTopic.topicName}</span>
    </div>
  );
}
