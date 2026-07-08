import Link from "next/link";
import type { ResearchTopic } from "@/lib/research/research-topics";
import {
  getGlobalResearchGraphPreview,
  getResearchGraphForTopicObject,
} from "@/lib/research/graph/research-graph-query";
import ResearchGraphCanvas from "@/components/research/graph/ResearchGraphCanvas";
import ResearchGraphLegend from "@/components/research/graph/ResearchGraphLegend";
import { cbaiBtnSecondary, cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchGraphPanelProps =
  | { variant: "global" }
  | { variant: "topic"; topic: ResearchTopic; embedded?: boolean };

export default function ResearchGraphPanel(props: ResearchGraphPanelProps) {
  const isGlobal = props.variant === "global";
  const embedded = props.variant === "topic" ? (props.embedded ?? false) : false;
  const graph = isGlobal
    ? getGlobalResearchGraphPreview()
    : getResearchGraphForTopicObject(props.topic);

  const starterHref = isGlobal
    ? "/research/microbiology"
    : props.topic
      ? `/research/${props.topic.topicId}`
      : "/research";

  return (
    <section
      aria-labelledby={isGlobal ? "global-research-graph-heading" : "topic-research-graph-heading"}
      className="space-y-4"
    >
      {!embedded ? (
        <div>
          <p className={cbaiSectionEyebrow}>Research graph</p>
          <h2
            id={isGlobal ? "global-research-graph-heading" : "topic-research-graph-heading"}
            className="text-xl font-semibold text-zinc-100"
          >
            {isGlobal ? "Global Research Graph" : "Research graph"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {isGlobal
              ? "Navigate research topics through catalog connections — shared methods, evidence types, and future research objects."
              : "Focused catalog connections for this topic — not live scientific proof."}
          </p>
        </div>
      ) : (
        <h2 id="topic-research-graph-heading" className="text-sm font-semibold text-zinc-100">
          Research graph
        </h2>
      )}

      <ResearchGraphCanvas graph={graph} compact={isGlobal} />

      <div className={`${cbaiGlassCard} p-4`}>
        <ResearchGraphLegend />
      </div>

      {isGlobal ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link href={starterHref} className={cbaiBtnSecondary}>
            Start with Microbiology →
          </Link>
          <p className="text-xs text-zinc-600">
            Browse any topic to explore its research graph connections.
          </p>
        </div>
      ) : null}
    </section>
  );
}
