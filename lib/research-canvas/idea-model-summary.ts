/**
 * Human-readable Idea Model summary — confirmed sources only, no invented fields.
 */

import { displayInterpretationValue, migrateExtractedItem } from "@/lib/research-canvas/interpretation-integrity";
import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";

export type IdeaModelSummaryItem = {
  readonly field: string;
  readonly value: string;
  readonly sourceRef: string | null;
};

export type IdeaModelSummary = {
  readonly problem: string;
  readonly purpose: string;
  readonly intendedOutcome: string;
  readonly assumptions: readonly string[];
  readonly unknowns: readonly string[];
  readonly successCriteria: readonly string[];
  readonly confirmedSources: readonly IdeaModelSummaryItem[];
  readonly rejectedExcludedCount: number;
};

const UNKNOWN = "Unknown / Needs user input";

export function buildIdeaModelSummary(idea: SmartIdea): IdeaModelSummary {
  const model = idea.ideaModel;
  const items = idea.extractedItems.map(migrateExtractedItem);
  const confirmed = items.filter((i) => i.confirmationStatus === "Confirmed");
  const rejected = items.filter((i) => i.confirmationStatus === "Rejected");

  const confirmedSources: IdeaModelSummaryItem[] = confirmed.map((item) => ({
    field: item.field,
    value: displayInterpretationValue(item),
    sourceRef: item.sourceLocation ?? null,
  }));

  const assumptions =
    model?.assumptions && model.assumptions.length > 0
      ? model.assumptions
      : [UNKNOWN];

  const unknowns =
    model?.unknowns && model.unknowns.length > 0
      ? model.unknowns
      : [UNKNOWN];

  const successCriteria =
    model?.requiredValidation && model.requiredValidation.length > 0
      ? model.requiredValidation
      : [UNKNOWN];

  return {
    problem: idea.problem.trim() || UNKNOWN,
    purpose: idea.purpose.trim() || UNKNOWN,
    intendedOutcome:
      model?.expectedOutcome?.trim() ||
      model?.expectedOutput?.trim() ||
      idea.expectedResult.trim() ||
      UNKNOWN,
    assumptions,
    unknowns,
    successCriteria,
    confirmedSources,
    rejectedExcludedCount: rejected.length,
  };
}
