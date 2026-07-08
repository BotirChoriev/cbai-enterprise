import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiGlassCard } from "@/components/brand/brand-classes";

type WorkspaceTopicNavigatorProps = {
  topic: ResearchTopic;
};

export default function WorkspaceTopicNavigator({ topic }: WorkspaceTopicNavigatorProps) {
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
        className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
      >
        Open topic page →
      </Link>
    </div>
  );
}
