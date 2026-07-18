/**
 * Decision Support Package builder.
 */

import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import {
  loadDiscoveryResults,
  buildHistoricalTimeline,
  compareIdeaToRecord,
} from "@/lib/research-canvas/research-discovery";
import { loadMeasurementPassports, loadMeasurementPlans } from "@/lib/research-canvas/measurement-store";
import {
  getResearchCanvasRuntimeCopy,
  type ResearchCanvasRuntimeCopy,
} from "@/lib/i18n/research-canvas-runtime-copy";

export type DecisionSupportPackage = {
  readonly facts: readonly string[];
  readonly userConfirmedInterpretation: readonly string[];
  readonly measurements: readonly string[];
  readonly priorWork: readonly string[];
  readonly contradictions: readonly string[];
  readonly unknown: readonly string[];
  readonly options: readonly string[];
  readonly tradeOffs: readonly string[];
  readonly requiredValidation: readonly string[];
  readonly humanityImpact: string;
  readonly natureImpact: string;
  readonly humanDecisionBoundary: string;
};

function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

export function buildDecisionSupportPackage(
  idea: SmartIdea,
  copy: ResearchCanvasRuntimeCopy = getResearchCanvasRuntimeCopy("en"),
): DecisionSupportPackage {
  const discoveries = loadDiscoveryResults(idea.id);
  const passports = loadMeasurementPassports(idea.id);
  const plans = loadMeasurementPlans(idea.id);
  const timeline = buildHistoricalTimeline(idea.id);

  const confirmed = idea.extractedItems.filter((e) => e.confirmationStatus === "Confirmed");

  return {
    facts: [
      fill(copy.smartIdeaDomainFact, { title: idea.title, domain: idea.domain }),
      ...discoveries.slice(0, 3).map((d) =>
        fill(copy.sourceRecordFact, {
          title: d.title,
          provider: d.provider,
          doi: d.doi ? ` DOI:${d.doi}` : "",
        }),
      ),
      ...timeline.slice(0, 2).map((t) => fill(copy.timelineFact, { date: t.date, title: t.title })),
    ],
    userConfirmedInterpretation: confirmed.map((e) =>
      fill(copy.confirmedInterpretation, {
        field: e.field,
        value: e.userCorrection ?? e.extractedValue,
      }),
    ),
    measurements: passports.map((p) =>
      fill(copy.measurementEntry, {
        measurand: p.measurand,
        result: p.result,
        unit: p.unit,
        status: p.validationStatus,
        limitations: p.limitations,
      }),
    ),
    priorWork: discoveries.slice(0, 5).map((d) => d.title),
    contradictions: discoveries
      .filter((d) => d.projectStatus === "Negative Result" || d.projectStatus === "Inconclusive")
      .map((d) => fill(copy.potentialContradiction, { title: d.title })),
    unknown: [
      ...(idea.ideaModel?.unknowns ?? []),
      ...(plans.length === 0 ? [copy.noMeasurementPlan] : []),
      ...(discoveries.length === 0 ? [copy.noConnectedOpenScience] : []),
    ],
    options: [
      copy.optionRefineMeasurement,
      copy.optionLivingResearchObject,
      copy.optionResearchMission,
      copy.optionCollaborationNeed,
      copy.optionPauseExpertReview,
    ],
    tradeOffs: [copy.tradeoffRigor, copy.tradeoffOpenScience, copy.tradeoffMissionPublish],
    requiredValidation: idea.ideaModel?.requiredValidation ?? [copy.expertReviewRequired],
    humanityImpact: idea.ideaModel?.humanityBenefit ?? copy.notDocumented,
    natureImpact: idea.ideaModel?.natureImpact ?? copy.notDocumented,
    humanDecisionBoundary: copy.humanDecisionBoundary,
  };
}

export function buildDecisionComparisonNotes(
  idea: SmartIdea,
  copy: ResearchCanvasRuntimeCopy = getResearchCanvasRuntimeCopy("en"),
): string[] {
  const discoveries = loadDiscoveryResults(idea.id);
  if (discoveries.length === 0) return [copy.noRecordsForComparison];
  return discoveries.slice(0, 2).flatMap((d) => {
    const c = compareIdeaToRecord(idea, d, copy);
    return [fill(copy.compareWith, { title: d.title }), ...c.similarities, ...c.differences];
  });
}
