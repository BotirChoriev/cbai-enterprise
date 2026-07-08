import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { buildKnowledgeTimeline } from "@/lib/research/timeline/timeline-builder";
import type { KnowledgeTimeline } from "@/lib/research/timeline/timeline-types";

/** Get a knowledge timeline for a topic ID. */
export function getKnowledgeTimelineForTopic(topicId: string): KnowledgeTimeline | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildKnowledgeTimeline(topic);
}

/** Get a knowledge timeline for a topic object. */
export function getKnowledgeTimelineForTopicObject(topic: ResearchTopic): KnowledgeTimeline {
  return buildKnowledgeTimeline(topic);
}

/** Find a stage in a timeline by ID. */
export function findTimelineStage(timeline: KnowledgeTimeline, stageId: string) {
  return timeline.stages.find((stage) => stage.stageId === stageId);
}
