import type { ResearchTopic } from "@/lib/research/research-topics";
import { getKnowledgeTimelineForTopicObject } from "@/lib/research/timeline/timeline-query";
import {
  TIMELINE_HUMAN_REVIEW_NOTICE,
  TIMELINE_WORKFLOW_NOTICE,
} from "@/lib/research/timeline/timeline-types";
import TimelineStage from "@/components/research/timeline/TimelineStage";
import TimelineConnector from "@/components/research/timeline/TimelineConnector";
import TimelineLegend from "@/components/research/timeline/TimelineLegend";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type KnowledgeTimelineProps = {
  topic: ResearchTopic;
  embedded?: boolean;
};

export default function KnowledgeTimeline({ topic, embedded = false }: KnowledgeTimelineProps) {
  const timeline = getKnowledgeTimelineForTopicObject(topic);

  return (
    <section aria-labelledby="topic-knowledge-evolution-heading" className="space-y-4">
      {!embedded ? (
        <div>
          <p className={cbaiSectionEyebrow}>Knowledge evolution</p>
          <h2 id="topic-knowledge-evolution-heading" className="text-xl font-semibold text-zinc-100">
            Knowledge Evolution
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Understand how research around this topic progresses over time.
          </p>
          <p className="mt-2 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
            {TIMELINE_WORKFLOW_NOTICE}
          </p>
        </div>
      ) : (
        <h2 id="topic-knowledge-evolution-heading" className="text-sm font-semibold text-zinc-100">
          Knowledge Evolution
        </h2>
      )}

      <div className={`${cbaiGlassCard} space-y-0 p-4`}>
        <ol className="space-y-0">
          {timeline.stages.map((stage, index) => (
            <li key={stage.stageId}>
              <TimelineStage stage={stage} />
              {index < timeline.stages.length - 1 ? <TimelineConnector /> : null}
            </li>
          ))}
        </ol>

        <div className="mt-4 border-t border-zinc-800/80 pt-4">
          <TimelineLegend />
          {!embedded ? (
            <p className="mt-3 text-[11px] text-zinc-600">{TIMELINE_HUMAN_REVIEW_NOTICE}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
