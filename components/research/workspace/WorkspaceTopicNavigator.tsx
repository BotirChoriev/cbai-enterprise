"use client";

import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type WorkspaceTopicNavigatorProps = {
  topic: ResearchTopic;
};

export default function WorkspaceTopicNavigator({ topic }: WorkspaceTopicNavigatorProps) {
  const { t } = useTranslation();
  return (
    <div className={`${cbaiGlassCard} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Current topic
        </p>
        <p className="text-sm font-semibold text-zinc-100">{topic.topicName}</p>
        <p className="text-xs text-zinc-500">{topic.domain}</p>
      </div>
      <Link
        href={getResearchTopicPath(topic.topicId)}
        className="text-xs font-medium text-teal-400 transition-colors hover:text-teal-300"
      >
        {t("research.openTopic")} →
      </Link>
    </div>
  );
}
