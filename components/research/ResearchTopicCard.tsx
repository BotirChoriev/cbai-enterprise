import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getResearchTopicPath,
  RESEARCH_TOPIC_STATUS_LABELS,
} from "@/lib/research/research-topics";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

function statusBadgeClass(topic: ResearchTopic["status"]): string {
  switch (topic) {
    case "catalog_available":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
    case "workspace_not_available":
      return "border-cyan-500/25 bg-cyan-500/5 text-cyan-300";
    case "evidence_not_connected":
      return "border-zinc-600/80 bg-zinc-900/60 text-zinc-400";
  }
}

type ResearchTopicCardProps = {
  topic: ResearchTopic;
  methodsLabel?: string;
  evidenceLabel?: string;
  actionLabel?: string;
};

export default function ResearchTopicCard({
  topic,
  methodsLabel = "Methods",
  evidenceLabel = "Evidence types",
  actionLabel = "Open topic",
}: ResearchTopicCardProps) {
  const topicPath = getResearchTopicPath(topic.topicId);

  return (
    <article className={`${cbaiGlassCard} flex h-full flex-col p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {topic.domain}
          </p>
          <h3 className="mt-1 text-base font-semibold text-zinc-50">{topic.topicName}</h3>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusBadgeClass(topic.status)}`}
        >
          {RESEARCH_TOPIC_STATUS_LABELS[topic.status]}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{topic.description}</p>

      <dl className="mt-4 space-y-3 border-t border-cyan-500/10 pt-4 text-sm">
        <div>
          <dt className="text-xs text-zinc-600">{methodsLabel}</dt>
          <dd className="mt-1 text-zinc-400">{topic.relatedMethods.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">{evidenceLabel}</dt>
          <dd className="mt-1 text-zinc-400">{topic.relatedEvidenceTypes.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">Future workspace</dt>
          <dd className="mt-1 text-xs leading-relaxed text-zinc-500">{topic.futureWorkspace}</dd>
        </div>
      </dl>

      <Link
        href={topicPath}
        className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-300 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/15 hover:text-cyan-200"
      >
        {actionLabel} →
      </Link>
    </article>
  );
}
