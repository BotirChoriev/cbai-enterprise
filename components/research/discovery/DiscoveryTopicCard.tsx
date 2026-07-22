"use client";

import Link from "next/link";
import type { CrossTopicDiscovery } from "@/lib/research/discovery/discovery-types";
import {
  DISCOVERY_STATUS_LABELS,
} from "@/lib/research/discovery/discovery-types";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import DiscoveryPath from "@/components/research/discovery/DiscoveryPath";
import { cbaiGlassCard } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";

type DiscoveryTopicCardProps = {
  sourceTopic: ResearchTopic;
  relatedTopic: ResearchTopic;
  discovery: CrossTopicDiscovery;
  compact?: boolean;
  onSelectTopic?: (topicId: string) => void;
};

export default function DiscoveryTopicCard({
  sourceTopic,
  relatedTopic,
  discovery,
  compact = false,
  onSelectTopic,
}: DiscoveryTopicCardProps) {
  const { t } = useTranslation();
  return (
    <article className={`${cbaiGlassCard} flex flex-col gap-3 p-3`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{relatedTopic.topicName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{relatedTopic.domain}</p>
        </div>
        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-300">
          {DISCOVERY_STATUS_LABELS[discovery.status]}
        </span>
      </div>

      <DiscoveryPath
        sourceTopic={sourceTopic}
        relatedTopic={relatedTopic}
        discovery={discovery}
        compact={compact}
      />

      {discovery.sharedMethods.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchCatalog.sharedMethods")}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{discovery.sharedMethods.join(" · ")}</p>
        </div>
      ) : null}

      {discovery.sharedEvidenceTypes.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            {t("researchCatalog.sharedEvidenceTypes")}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {discovery.sharedEvidenceTypes.join(" · ")}
          </p>
        </div>
      ) : null}

      {discovery.sharedDomain ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Domain</p>
          <p className="mt-1 text-xs text-zinc-400">{discovery.sharedDomain}</p>
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-zinc-800/80 pt-3">
        {onSelectTopic ? (
          <button
            type="button"
            onClick={() => onSelectTopic(relatedTopic.topicId)}
            className="text-xs font-medium text-teal-400 transition-colors hover:text-teal-300"
          >
            Open in workspace →
          </button>
        ) : null}
        <Link
          href={getResearchTopicPath(relatedTopic.topicId)}
          className="text-xs font-medium text-teal-400 transition-colors hover:text-teal-300"
        >
          {t("research.openTopic")} →
        </Link>
      </div>
    </article>
  );
}
