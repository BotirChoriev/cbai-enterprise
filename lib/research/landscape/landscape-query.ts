import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import {
  buildResearchLandscapeForTopic,
  getLandscapeFirstRing,
  getLandscapeSecondRing,
  getLandscapeThirdRing,
} from "@/lib/research/landscape/landscape-builder";
import type { ResearchLandscape } from "@/lib/research/landscape/landscape-types";

/** Resolve research landscape for a topic object. */
export function getResearchLandscapeForTopic(topic: ResearchTopic): ResearchLandscape {
  return buildResearchLandscapeForTopic(topic);
}

/** Resolve research landscape for a topic ID. */
export function getResearchLandscape(topicId: string): ResearchLandscape | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildResearchLandscapeForTopic(topic);
}

export {
  getLandscapeFirstRing,
  getLandscapeSecondRing,
  getLandscapeThirdRing,
};
