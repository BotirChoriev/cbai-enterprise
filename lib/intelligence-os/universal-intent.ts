/**
 * Universal Intent Engine — one deterministic path for typing, voice, and command entry.
 * Extends assistant-commands; no probabilistic AI routing.
 */

import { resolveAssistantCommand, type AssistantCommandMatch } from "@/lib/assistant/assistant-commands";

export type IntentCategory =
  | "start_mission"
  | "continue_mission"
  | "search_entity"
  | "open_object"
  | "compare_entities"
  | "inspect_evidence"
  | "open_reasoning"
  | "review_impact"
  | "open_report"
  | "continue_research"
  | "open_knowledge"
  | "unrecognized";

export type UniversalIntentResult = {
  readonly normalizedInput: string;
  readonly category: IntentCategory;
  readonly command: AssistantCommandMatch | null;
};

function categorize(match: AssistantCommandMatch): IntentCategory {
  const href = match.href;
  if (href === "/" || href.startsWith("/?create")) return "start_mission";
  if (href.startsWith("/my-work")) return "continue_mission";
  if (href.startsWith("/search")) return "search_entity";
  if (href.startsWith("/knowledge")) return "inspect_evidence";
  if (href.startsWith("/reasoning")) return "open_reasoning";
  if (href.startsWith("/reports")) return "open_report";
  if (href.startsWith("/research")) return "continue_research";
  if (href.startsWith("/graph")) return "compare_entities";
  if (href.includes("human-impact") || href.includes("impact")) return "review_impact";
  if (
    href.startsWith("/countries") ||
    href.startsWith("/companies") ||
    href.startsWith("/universities")
  ) {
    return "open_object";
  }
  return "open_object";
}

export function resolveUniversalIntent(rawInput: string): UniversalIntentResult {
  const normalizedInput = rawInput.trim();
  if (!normalizedInput) {
    return { normalizedInput, category: "unrecognized", command: null };
  }

  const command = resolveAssistantCommand(normalizedInput);
  if (!command) {
    return { normalizedInput, category: "unrecognized", command: null };
  }

  return {
    normalizedInput,
    category: categorize(command),
    command,
  };
}

const INTENT_CATEGORY_KEYS: Record<IntentCategory, string> = {
  start_mission: "universalIntent.categoryStartMission",
  continue_mission: "universalIntent.categoryContinueMission",
  search_entity: "universalIntent.categorySearchEntity",
  open_object: "universalIntent.categoryOpenObject",
  compare_entities: "universalIntent.categoryCompareEntities",
  inspect_evidence: "universalIntent.categoryInspectEvidence",
  open_reasoning: "universalIntent.categoryOpenReasoning",
  review_impact: "universalIntent.categoryReviewImpact",
  open_report: "universalIntent.categoryOpenReport",
  continue_research: "universalIntent.categoryContinueResearch",
  open_knowledge: "universalIntent.categoryInspectEvidence",
  unrecognized: "universalIntent.categoryUnrecognized",
};

export function intentCategoryTranslationKey(category: IntentCategory): string {
  return INTENT_CATEGORY_KEYS[category];
}
