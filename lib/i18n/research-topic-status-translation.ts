import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import type { ResearchTopicStatus } from "@/lib/research/research-topics";

export function translateResearchTopicStatus(
  dictionary: TranslationDictionary,
  status: ResearchTopicStatus,
): string {
  return dictionary.researchCatalog.topicStatus[status];
}
