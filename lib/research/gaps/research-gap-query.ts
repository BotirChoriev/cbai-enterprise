import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import {
  buildResearchGapContext,
  buildResearchGapsForTopic,
  selectTopicDetailGaps,
} from "@/lib/research/gaps/research-gap-builder";
import type { ResearchGap, ResearchGapContext, ResearchGapType } from "@/lib/research/gaps/research-gap-types";
import { WORKSPACE_GAP_TYPES } from "@/lib/research/gaps/research-gap-types";

/** Resolve research gap context for a topic object. */
export function getResearchGapContextForTopic(topic: ResearchTopic): ResearchGapContext {
  return buildResearchGapContext(topic);
}

/** Resolve research gap context for a topic ID. */
export function getResearchGapContext(topicId: string): ResearchGapContext | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildResearchGapContext(topic);
}

/** List all gaps for a topic. */
export function getResearchGapsForTopic(topic: ResearchTopic): readonly ResearchGap[] {
  return buildResearchGapsForTopic(topic);
}

/** List gaps filtered by type. */
export function getResearchGapsByType(
  topic: ResearchTopic,
  gapTypes: readonly ResearchGapType[],
): readonly ResearchGap[] {
  const typeSet = new Set(gapTypes);
  return buildResearchGapsForTopic(topic).filter((gap) => typeSet.has(gap.gapType));
}

/** Gaps for topic detail pages (4–6 prioritized). */
export function getTopicDetailResearchGaps(
  topic: ResearchTopic,
  limit = 6,
): readonly ResearchGap[] {
  return selectTopicDetailGaps(buildResearchGapsForTopic(topic), limit);
}

/** Gaps for workspace explorer panel. */
export function getWorkspaceResearchGaps(topic: ResearchTopic): readonly ResearchGap[] {
  return getResearchGapsByType(topic, WORKSPACE_GAP_TYPES);
}

/** Find a single gap by type for a topic. */
export function findResearchGapByType(
  topic: ResearchTopic,
  gapType: ResearchGapType,
): ResearchGap | undefined {
  return buildResearchGapsForTopic(topic).find((gap) => gap.gapType === gapType);
}
