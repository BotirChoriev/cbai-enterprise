"use client";

import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateResearchTopicStatus } from "@/lib/i18n/research-topic-status-translation";
import ResearchWorkspaceFacets from "@/components/enterprise/ResearchWorkspaceFacets";

function statusBadgeClass(topic: ResearchTopic["status"]): string {
  switch (topic) {
    case "catalog_available":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
    case "workspace_not_available":
      return "border-teal-500/25 bg-teal-500/5 text-teal-300";
    case "evidence_not_connected":
      return "border-zinc-600/80 bg-zinc-900/60 text-zinc-400";
  }
}

type ResearchTopicCardProps = {
  topic: ResearchTopic;
  methodsLabel?: string;
  evidenceLabel?: string;
  actionLabel?: string;
  futureWorkspaceLabel?: string;
};

export default function ResearchTopicCard({
  topic,
  methodsLabel,
  evidenceLabel,
  actionLabel,
  futureWorkspaceLabel,
}: ResearchTopicCardProps) {
  const { language } = useTranslation();
  const catalog = getDictionary(language).researchCatalog;
  const topicPath = getResearchTopicPath(topic.topicId);
  const statusLabel = translateResearchTopicStatus(getDictionary(language), topic.status);

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
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{topic.description}</p>

      <dl className="mt-4 space-y-3 border-t border-teal-500/10 pt-4 text-sm">
        <div>
          <dt className="text-xs text-zinc-600">{methodsLabel ?? catalog.methods}</dt>
          <dd className="mt-1 text-zinc-400">{topic.relatedMethods.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">{evidenceLabel ?? catalog.evidenceTypes}</dt>
          <dd className="mt-1 text-zinc-400">{topic.relatedEvidenceTypes.join(" · ")}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-600">{futureWorkspaceLabel ?? catalog.futureWorkspace}</dt>
          <dd className="mt-1 text-xs leading-relaxed text-zinc-500">{topic.futureWorkspace}</dd>
        </div>
      </dl>

      <ResearchWorkspaceFacets topic={topic} compact />

      <Link
        href={topicPath}
        className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-teal-500/25 bg-teal-500/10 px-4 text-sm font-medium text-teal-300 transition-colors hover:border-teal-500/40 hover:bg-teal-500/15 hover:text-teal-200"
      >
        {actionLabel ?? catalog.openTopic} →
      </Link>
    </article>
  );
}
