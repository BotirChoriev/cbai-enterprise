import type { ResearchTopic } from "@/lib/research/research-topics";
import { getResearchTopicById } from "@/lib/research/research-topics";
import { buildResearchNotebook } from "@/lib/research/notebook/notebook-builder";
import type { ResearchNotebook } from "@/lib/research/notebook/notebook-types";

/** Get a research notebook for a topic ID. */
export function getResearchNotebookForTopic(topicId: string): ResearchNotebook | undefined {
  const topic = getResearchTopicById(topicId);
  if (!topic) {
    return undefined;
  }
  return buildResearchNotebook(topic);
}

/** Get a research notebook for a topic object. */
export function getResearchNotebookForTopicObject(topic: ResearchTopic): ResearchNotebook {
  return buildResearchNotebook(topic);
}

/** Find a summary section in a notebook by ID. */
export function findNotebookSummarySection(
  notebook: ResearchNotebook,
  sectionId: string,
) {
  return notebook.summarySections.find((section) => section.sectionId === sectionId);
}
