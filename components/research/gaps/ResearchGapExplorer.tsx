import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getResearchGapContextForTopic,
  getTopicDetailResearchGaps,
  getWorkspaceResearchGaps,
} from "@/lib/research/gaps/research-gap-query";
import {
  RESEARCH_GAP_HONEST_NOTICE,
  RESEARCH_GAP_HUMAN_REVIEW_NOTICE,
} from "@/lib/research/gaps/research-gap-types";
import ResearchGapSummary from "@/components/research/gaps/ResearchGapSummary";
import ResearchGapCard from "@/components/research/gaps/ResearchGapCard";
import ResearchGapSources from "@/components/research/gaps/ResearchGapSources";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchGapExplorerProps = {
  topic: ResearchTopic;
  variant?: "topic" | "workspace";
  limit?: number;
  embedded?: boolean;
};

export default function ResearchGapExplorer({
  topic,
  variant = "topic",
  limit,
  embedded = false,
}: ResearchGapExplorerProps) {
  const context = getResearchGapContextForTopic(topic);
  const compact = variant === "workspace";
  const gaps =
    variant === "workspace"
      ? getWorkspaceResearchGaps(topic)
      : getTopicDetailResearchGaps(topic, limit ?? 6);
  const headingId =
    variant === "topic" ? "topic-research-gaps-heading" : "workspace-knowledge-gaps-heading";
  const title = variant === "topic" ? "Research gaps" : "Knowledge gaps";

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div>
        <p className={cbaiSectionEyebrow}>Missing evidence</p>
        <h2 id={headingId} className="text-sm font-semibold text-zinc-100">
          {title}
        </h2>
        {!embedded ? (
          <p className="mt-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
            {RESEARCH_GAP_HONEST_NOTICE}
          </p>
        ) : null}
      </div>

      {variant === "topic" ? (
        <div className={`${cbaiGlassCard} p-4`}>
          <ResearchGapSummary
            catalogOnlyCount={context.summary.catalogOnlyCount}
            notConnectedCount={context.summary.notConnectedCount}
            futureWorkspaceCount={context.summary.futureWorkspaceCount}
            catalogAvailable={context.summary.catalogAvailable}
          />
        </div>
      ) : null}

      <div className={`grid gap-2 ${variant === "topic" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {gaps.map((gap) => (
          <ResearchGapCard key={gap.gapId} gap={gap} compact={compact} />
        ))}
      </div>

      {variant === "topic" ? <ResearchGapSources gaps={gaps} /> : null}

      {!embedded ? (
        <p className="text-[11px] text-zinc-600">{RESEARCH_GAP_HUMAN_REVIEW_NOTICE}</p>
      ) : null}
    </section>
  );
}
