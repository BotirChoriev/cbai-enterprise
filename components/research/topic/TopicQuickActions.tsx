"use client";

import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { WORKSPACE_PATH } from "@/lib/research/workspace/workspace-types";
import type { TopicTabId } from "@/components/research/topic/TopicSectionTabs";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function workspacePathForTopic(topicId: string): string {
  return `${WORKSPACE_PATH}?topic=${encodeURIComponent(topicId)}`;
}

type TopicQuickActionsProps = {
  topic: ResearchTopic;
  onTabChange: (tab: TopicTabId) => void;
};

type ActionItem = {
  labelKey: "openWorkspace" | "exploreRelated" | "viewGraph" | "reviewNotebook";
  detailKey: "openWorkspaceDetail" | "exploreRelatedDetail" | "viewGraphDetail" | "reviewNotebookDetail";
  onClick?: () => void;
  href?: string;
};

export default function TopicQuickActions({ topic, onTabChange }: TopicQuickActionsProps) {
  const { t } = useTranslation();

  const actions: ActionItem[] = [
    {
      labelKey: "openWorkspace",
      detailKey: "openWorkspaceDetail",
      href: workspacePathForTopic(topic.topicId),
    },
    {
      labelKey: "exploreRelated",
      detailKey: "exploreRelatedDetail",
      onClick: () => onTabChange("overview"),
    },
    {
      labelKey: "viewGraph",
      detailKey: "viewGraphDetail",
      onClick: () => onTabChange("graph"),
    },
    {
      labelKey: "reviewNotebook",
      detailKey: "reviewNotebookDetail",
      onClick: () => onTabChange("notebook"),
    },
  ];

  return (
    <aside aria-label={t("researchTopicDepth.quickActionsAriaLabel")} className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>{t("researchTopicDepth.quickActionsEyebrow")}</p>
        <h2 className="text-sm font-semibold text-zinc-100">{t("researchTopicDepth.quickActionsTitle")}</h2>
      </div>

      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.labelKey}>
            {action.href ? (
              <Link
                href={action.href}
                className={`${cbaiGlassCard} block p-3 transition-colors hover:border-teal-500/25`}
              >
                <p className="text-xs font-medium text-teal-400">{t(`researchTopicDepth.${action.labelKey}`)} →</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">{t(`researchTopicDepth.${action.detailKey}`)}</p>
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className={`${cbaiGlassCard} w-full p-3 text-left transition-colors hover:border-teal-500/25`}
              >
                <p className="text-xs font-medium text-teal-400">{t(`researchTopicDepth.${action.labelKey}`)} →</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">{t(`researchTopicDepth.${action.detailKey}`)}</p>
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-zinc-600">
        {t("researchTopicDepth.topicLabel", { name: topic.topicName })}
      </p>
    </aside>
  );
}
