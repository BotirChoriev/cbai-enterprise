/**
 * Decision Support Package builder.
 */

import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { loadDiscoveryResults, buildHistoricalTimeline, compareIdeaToRecord } from "@/lib/research-canvas/research-discovery";
import { loadMeasurementPassports, loadMeasurementPlans } from "@/lib/research-canvas/measurement-store";

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

export function buildDecisionSupportPackage(idea: SmartIdea): DecisionSupportPackage {
  const discoveries = loadDiscoveryResults(idea.id);
  const passports = loadMeasurementPassports(idea.id);
  const plans = loadMeasurementPlans(idea.id);
  const timeline = buildHistoricalTimeline(idea.id);

  const confirmed = idea.extractedItems.filter((e) => e.confirmationStatus === "Confirmed");

  return {
    facts: [
      `Smart Idea "${idea.title}" — domain: ${idea.domain}.`,
      ...discoveries.slice(0, 3).map((d) => `Source record: ${d.title} (${d.provider}${d.doi ? ` DOI:${d.doi}` : ""}).`),
      ...timeline.slice(0, 2).map((t) => `Timeline: ${t.date} — ${t.title}.`),
    ],
    userConfirmedInterpretation: confirmed.map(
      (e) => `${e.field}: ${e.userCorrection ?? e.extractedValue} (confirmed)`,
    ),
    measurements: passports.map(
      (p) => `${p.measurand}: ${p.result} ${p.unit} — status ${p.validationStatus} — ${p.limitations}`,
    ),
    priorWork: discoveries.slice(0, 5).map((d) => d.title),
    contradictions: discoveries
      .filter((d) => d.projectStatus === "Negative Result" || d.projectStatus === "Inconclusive")
      .map((d) => `Potential contradiction: ${d.title}`),
    unknown: [
      ...(idea.ideaModel?.unknowns ?? []),
      ...(plans.length === 0 ? ["No measurement plan defined."] : []),
      ...(discoveries.length === 0 ? ["No connected open-science records imported."] : []),
    ],
    options: [
      "Refine measurement plan and collect raw data.",
      "Create Living Research Object and link evidence.",
      "Create Research Mission and structured project.",
      "Declare collaboration or funding need.",
      "Pause and seek expert review.",
    ],
    tradeOffs: [
      "More measurement rigor requires time, instruments, and calibration.",
      "Open-science search covers connected metadata only — not all global research.",
      "Mission creation does not auto-publish private artifacts.",
    ],
    requiredValidation: idea.ideaModel?.requiredValidation ?? ["Expert review may be required."],
    humanityImpact: idea.ideaModel?.humanityBenefit ?? "Not documented.",
    natureImpact: idea.ideaModel?.natureImpact ?? "Not documented.",
    humanDecisionBoundary:
      "CBAI presents facts, analysis, uncertainty, and options. The human selects the final path.",
  };
}

export function buildDecisionComparisonNotes(idea: SmartIdea): string[] {
  const discoveries = loadDiscoveryResults(idea.id);
  if (discoveries.length === 0) return ["No records selected for comparison."];
  return discoveries.slice(0, 2).flatMap((d) => {
    const c = compareIdeaToRecord(idea, d);
    return [`Compare with: ${d.title}`, ...c.similarities, ...c.differences];
  });
}
