import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { RESEARCH_TOPIC_STATUS_LABELS } from "@/lib/research/research-topics";
import { toResearchTopicEntity } from "@/lib/research-topic.adapter";
import EntityHeader from "@/components/shared/EntityHeader";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function statusBadgeClass(status: ResearchTopic["status"]): string {
  switch (status) {
    case "catalog_available":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
    case "workspace_not_available":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "evidence_not_connected":
      return "border-zinc-600/80 bg-zinc-900/60 text-zinc-400";
  }
}

type ResearchTopicHeroProps = {
  topic: ResearchTopic;
};

export default function ResearchTopicHero({ topic }: ResearchTopicHeroProps) {
  return (
    <header className="space-y-5">
      <Link
        href="/research"
        className="inline-flex text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
      >
        ← Back to Research topics
      </Link>

      <div className={`${cbaiGlassCard} space-y-4 p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={cbaiSectionEyebrow}>{topic.domain}</p>
            <h1 className="cbai-display mt-2 text-3xl text-zinc-50 sm:text-4xl">
              {topic.topicName}
            </h1>
          </div>
          <span
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusBadgeClass(topic.status)}`}
          >
            {RESEARCH_TOPIC_STATUS_LABELS[topic.status]}
          </span>
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400">{topic.description}</p>
      </div>

      <EntityHeader entity={toResearchTopicEntity(topic)} showName={false} />

      <p className="text-sm leading-relaxed text-zinc-500">
        Human review is required before any scientific claim on this topic supports a decision.
      </p>
    </header>
  );
}
