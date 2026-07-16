import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { WORKSPACE_PATH } from "@/lib/research/workspace/workspace-types";
import type { TopicTabId } from "@/components/research/topic/TopicSectionTabs";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

function workspacePathForTopic(topicId: string): string {
  return `${WORKSPACE_PATH}?topic=${encodeURIComponent(topicId)}`;
}

type TopicQuickActionsProps = {
  topic: ResearchTopic;
  onTabChange: (tab: TopicTabId) => void;
};

type ActionItem = {
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
};

export default function TopicQuickActions({ topic, onTabChange }: TopicQuickActionsProps) {
  const actions: ActionItem[] = [
    {
      label: "Open workspace",
      description: "Continue research review for this topic",
      href: workspacePathForTopic(topic.topicId),
    },
    {
      label: "Explore related topics",
      description: "Catalog connections in overview",
      onClick: () => onTabChange("overview"),
    },
    {
      label: "View research graph",
      description: "Knowledge connections",
      onClick: () => onTabChange("graph"),
    },
    {
      label: "Review notebook",
      description: "Structured research notebook",
      onClick: () => onTabChange("notebook"),
    },
  ];

  return (
    <aside aria-label="Quick actions" className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>Next steps</p>
        <h2 className="text-sm font-semibold text-zinc-100">Quick actions</h2>
      </div>

      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.label}>
            {action.href ? (
              <Link
                href={action.href}
                className={`${cbaiGlassCard} block p-3 transition-colors hover:border-teal-500/25`}
              >
                <p className="text-xs font-medium text-teal-400">{action.label} →</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">{action.description}</p>
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className={`${cbaiGlassCard} w-full p-3 text-left transition-colors hover:border-teal-500/25`}
              >
                <p className="text-xs font-medium text-teal-400">{action.label} →</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">{action.description}</p>
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-zinc-600">
        Topic: <span className="text-zinc-500">{topic.topicName}</span>
      </p>
    </aside>
  );
}
