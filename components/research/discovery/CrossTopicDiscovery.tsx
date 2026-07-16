import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { getCrossTopicDiscoveriesForTopic } from "@/lib/research/discovery/discovery-query";
import {
  DISCOVERY_CATALOG_NOTICE,
  DISCOVERY_HUMAN_REVIEW_NOTICE,
} from "@/lib/research/discovery/discovery-types";
import DiscoveryTopicCard from "@/components/research/discovery/DiscoveryTopicCard";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type CrossTopicDiscoveryProps = {
  topic: ResearchTopic;
  variant?: "workspace" | "topic";
  limit?: number;
  onSelectTopic?: (topicId: string) => void;
};

export default function CrossTopicDiscovery({
  topic,
  variant = "workspace",
  limit,
  onSelectTopic,
}: CrossTopicDiscoveryProps) {
  const effectiveLimit = limit ?? (variant === "topic" ? 6 : 8);
  const discoveries = getCrossTopicDiscoveriesForTopic(topic, effectiveLimit);
  const compact = variant === "topic";
  const headingId =
    variant === "topic" ? "topic-related-topics-heading" : "workspace-related-topics-heading";
  const title = variant === "topic" ? "Related topics" : "Related research topics";
  const subtitle =
    variant === "topic"
      ? "Research discovery from catalog metadata — up to six related topics."
      : "Research discovery from catalog metadata for the current workspace topic.";

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>Research discovery</p>
        <h2 id={headingId} className="text-sm font-semibold text-zinc-100">
          {title}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        <p className="mt-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
          {DISCOVERY_CATALOG_NOTICE}
        </p>
      </div>

      {discoveries.length === 0 ? (
        <div className={`${cbaiGlassCard} space-y-2 p-4`}>
          <p className="text-xs text-zinc-500">No related topics found from catalog metadata for this topic.</p>
          <Link
            href="/research"
            className="inline-flex items-center text-xs font-medium text-teal-400 hover:text-teal-300"
          >
            Browse the full Research catalog →
          </Link>
        </div>
      ) : (
        <div
          className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {discoveries.map((discovery) => {
            const relatedTopic = getResearchTopicById(discovery.relatedTopicId);
            if (!relatedTopic) {
              return null;
            }

            return (
              <DiscoveryTopicCard
                key={discovery.discoveryId}
                sourceTopic={topic}
                relatedTopic={relatedTopic}
                discovery={discovery}
                compact={compact}
                onSelectTopic={variant === "workspace" ? onSelectTopic : undefined}
              />
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-zinc-600">{DISCOVERY_HUMAN_REVIEW_NOTICE}</p>
    </section>
  );
}
