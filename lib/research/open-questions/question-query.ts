import type { ResearchTopic } from "@/lib/research/research-topics";
import { OPEN_QUESTION_REGISTRY } from "@/lib/research/open-questions/question-registry";
import {
  OPEN_QUESTION_CATEGORIES,
  type OpenQuestionCategory,
  type OpenResearchQuestion,
} from "@/lib/research/open-questions/question-types";

export type OpenQuestionTopicContext = {
  topic: ResearchTopic;
  questions: readonly OpenResearchQuestion[];
  hasTopicSpecific: boolean;
};

/** Find an open question readiness entry by ID. */
export function findOpenQuestionById(questionId: string): OpenResearchQuestion | undefined {
  return OPEN_QUESTION_REGISTRY.find((question) => question.questionId === questionId);
}

/** Find open question readiness entries for a topic (topic-specific first, then global). */
export function findOpenQuestionsByTopic(topicId: string): readonly OpenResearchQuestion[] {
  const topicSpecific = OPEN_QUESTION_REGISTRY.filter((question) =>
    question.relatedTopicIds.includes(topicId),
  );

  if (topicSpecific.length > 0) {
    return topicSpecific;
  }

  return OPEN_QUESTION_REGISTRY.filter((question) => question.relatedTopicIds.length === 0);
}

/** List all open question categories. */
export function listOpenQuestionCategories(): readonly OpenQuestionCategory[] {
  return OPEN_QUESTION_CATEGORIES;
}

/** Resolve open question context for a research topic. */
export function getOpenQuestionsForTopic(topic: ResearchTopic): OpenQuestionTopicContext {
  const topicSpecific = OPEN_QUESTION_REGISTRY.filter((question) =>
    question.relatedTopicIds.includes(topic.topicId),
  );
  const questions =
    topicSpecific.length > 0
      ? topicSpecific
      : OPEN_QUESTION_REGISTRY.filter((question) => question.relatedTopicIds.length === 0);

  return {
    topic,
    questions,
    hasTopicSpecific: topicSpecific.length > 0,
  };
}

/** List all open question readiness entries. */
export function listOpenQuestions(): readonly OpenResearchQuestion[] {
  return OPEN_QUESTION_REGISTRY;
}
