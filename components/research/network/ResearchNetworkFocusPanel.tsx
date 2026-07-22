"use client";

import Link from "next/link";
import type { ResearchNetworkRelatedTopic } from "@/lib/research/network/network-query";
import type { ResearchNetworkNode } from "@/lib/research/network/network-types";
import {
  RESEARCH_CONNECTION_TYPE_LABELS,
  type ResearchConnectionType,
} from "@/lib/research/network/network-types";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  cbaiBtnPrimary,
  cbaiBtnSecondary,
  cbaiGlassCard,
  cbaiSectionEyebrow,
} from "@/components/brand/brand-classes";

const MAX_RELATED_TOPICS = 6;

type ResearchNetworkFocusPanelProps = {
  node: ResearchNetworkNode;
  relatedTopics: readonly ResearchNetworkRelatedTopic[];
  onSelectTopic: (topicId: string) => void;
  onClearFocus: () => void;
};

function formatConnectionTypes(types: readonly ResearchConnectionType[]): string {
  return types.map((type) => RESEARCH_CONNECTION_TYPE_LABELS[type]).join(" · ");
}

export default function ResearchNetworkFocusPanel({
  node,
  relatedTopics,
  onSelectTopic,
  onClearFocus,
}: ResearchNetworkFocusPanelProps) {
  const { t } = useTranslation();
  const topicPath = getResearchTopicPath(node.topicId);
  const visibleRelatedTopics = relatedTopics.slice(0, MAX_RELATED_TOPICS);

  return (
    <aside
      aria-labelledby="network-focus-heading"
      className={`${cbaiGlassCard} flex flex-col gap-4 border-teal-500/20 p-4 shadow-[0_0_32px_-8px_rgba(34,211,238,0.25)] transition-all duration-[250ms] lg:max-h-[720px] lg:overflow-y-auto`}
    >
      <div className="space-y-1">
        <p className={cbaiSectionEyebrow}>{t("researchCatalog.selectedTopicEyebrow")}</p>
        <h3 id="network-focus-heading" className="text-lg font-semibold text-zinc-100">
          {node.topicName}
        </h3>
        <p className="text-xs text-zinc-500">{node.domain}</p>
      </div>

      <section aria-labelledby="network-focus-methods-heading" className="space-y-2">
        <h4
          id="network-focus-methods-heading"
          className="text-[10px] font-medium uppercase tracking-wider text-zinc-600"
        >
          {t("researchCatalog.methods")}
        </h4>
        {node.sharedMethods.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {node.sharedMethods.map((method) => (
              <li
                key={method}
                className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[11px] text-emerald-300/90"
              >
                {method}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">No methods listed in catalog metadata.</p>
        )}
      </section>

      <section aria-labelledby="network-focus-evidence-heading" className="space-y-2">
        <h4
          id="network-focus-evidence-heading"
          className="text-[10px] font-medium uppercase tracking-wider text-zinc-600"
        >
          Evidence types
        </h4>
        {node.sharedEvidence.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {node.sharedEvidence.map((evidence) => (
              <li
                key={evidence}
                className="rounded-md border border-violet-500/20 bg-violet-500/5 px-2 py-1 text-[11px] text-violet-300/90"
              >
                {evidence}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">No evidence types listed in catalog metadata.</p>
        )}
      </section>

      <section aria-labelledby="network-focus-related-heading" className="space-y-2">
        <h4
          id="network-focus-related-heading"
          className="text-[10px] font-medium uppercase tracking-wider text-zinc-600"
        >
          Related topics
        </h4>
        {visibleRelatedTopics.length > 0 ? (
          <ul className="space-y-2">
            {visibleRelatedTopics.map((related) => (
              <li key={related.topicId}>
                <button
                  type="button"
                  onClick={() => onSelectTopic(related.topicId)}
                  className="w-full rounded-lg border border-zinc-800/80 bg-slate-950/50 px-3 py-2 text-left transition-all duration-[250ms] hover:border-teal-500/30 hover:bg-teal-500/5"
                >
                  <span className="block text-sm font-medium text-zinc-200">{related.topicName}</span>
                  <span className="mt-0.5 block text-[10px] text-zinc-500">{related.domain}</span>
                  <span className="mt-1 block text-[10px] text-teal-400/80">
                    {formatConnectionTypes(related.connectionTypes)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-500">No directly connected topics in the catalog network.</p>
        )}
      </section>

      <div className="mt-auto flex flex-col gap-2 border-t border-zinc-800/80 pt-4">
        <Link href={topicPath} className={`${cbaiBtnPrimary} w-full`}>
          {t("research.openTopic")} →
        </Link>
        <button type="button" onClick={onClearFocus} className={`${cbaiBtnSecondary} w-full`}>
          Clear focus
        </button>
      </div>
    </aside>
  );
}
