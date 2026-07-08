import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";
import { getCrossTopicDiscoveriesForTopic } from "@/lib/research/discovery/discovery-query";
import { getResearchTopicById, getResearchTopicPath } from "@/lib/research/research-topics";
import Link from "next/link";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

export const TOPIC_EXPERIENCE_NOTICE =
  "Research Intelligence currently uses catalog information and verified platform models. Live scientific databases are not connected yet.";

type TopicQuickOverviewProps = {
  topic: ResearchTopic;
};

function statusClass(status: ResearchTopic["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "workspace_not_available":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "evidence_not_connected":
      return "border-zinc-700 bg-zinc-900/60 text-zinc-400";
  }
}

export default function TopicQuickOverview({ topic }: TopicQuickOverviewProps) {
  const relatedTopics = getCrossTopicDiscoveriesForTopic(topic, 3);

  return (
    <section aria-labelledby="topic-quick-overview-heading" className="space-y-4">
      <div>
        <p className={cbaiSectionEyebrow}>Research overview</p>
        <h2 id="topic-quick-overview-heading" className="text-lg font-semibold text-zinc-100">
          Quick overview
        </h2>
      </div>

      <div className={`${cbaiGlassCard} grid gap-4 p-5 sm:grid-cols-2`}>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Topic</p>
          <p className="mt-1 text-sm font-medium text-zinc-100">{topic.topicName}</p>
          <p className="mt-1 text-xs text-zinc-500">{topic.description}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Domain</p>
          <p className="mt-1 text-sm text-zinc-300">{topic.domain}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Current status
          </p>
          <span
            className={`mt-2 inline-flex rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(topic.status)}`}
          >
            {RESEARCH_TOPIC_STATUS_LABELS[topic.status]}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Methods</p>
          <p className="mt-1 text-xs text-zinc-400">{topic.relatedMethods.join(" · ")}</p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Evidence types
          </p>
          <p className="mt-1 text-xs text-zinc-400">{topic.relatedEvidenceTypes.join(" · ")}</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Related topics
          </p>
          {relatedTopics.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {relatedTopics.map((discovery) => {
                const related = getResearchTopicById(discovery.relatedTopicId);
                if (!related) {
                  return null;
                }
                return (
                  <li key={discovery.discoveryId}>
                    <Link
                      href={getResearchTopicPath(related.topicId)}
                      className="rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-xs text-cyan-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-300"
                    >
                      {related.topicName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-zinc-600">No related topics from catalog metadata.</p>
          )}
        </div>

        <div className="sm:col-span-2 border-t border-zinc-800/80 pt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Human review
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Required before any catalog connection supports a research decision.
          </p>
        </div>
      </div>
    </section>
  );
}
