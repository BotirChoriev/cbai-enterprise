/**
 * Research Canvas honest report builders.
 */

import type { SmartIdea } from "@/lib/research-canvas/research-canvas-types";
import { buildDecisionSupportPackage } from "@/lib/research-canvas/decision-support";
import { loadMeasurementPassports, loadMeasurementPlans } from "@/lib/research-canvas/measurement-store";
import { loadDiscoveryResults, buildHistoricalTimeline } from "@/lib/research-canvas/research-discovery";

export type ResearchCanvasReport = {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly generatedAt: string;
  readonly scope: string;
  readonly sections: readonly { heading: string; body: string }[];
  readonly limitations: readonly string[];
  readonly humanDecisionBoundary: string;
  readonly available: boolean;
};

const BOUNDARY =
  "Final scientific, medical, legal, financial, and organizational decisions remain with qualified humans.";

export function buildInterpretationReport(idea: SmartIdea): ResearchCanvasReport {
  return {
    id: `rc-report-${Date.now()}`,
    kind: "Smart Idea Interpretation Report",
    title: `Interpretation — ${idea.title}`,
    generatedAt: new Date().toISOString(),
    scope: `smartIdea:${idea.id}`,
    sections: idea.extractedItems.map((e) => ({
      heading: e.field,
      body: `Extracted: ${e.extractedValue}\nStatus: ${e.confirmationStatus}\nAI confidence: ${e.aiConfidence} (not measurement uncertainty)\nLimitation: ${e.limitation}`,
    })),
    limitations: ["Interpretation report from device-local records.", "Unconfirmed extractions are not verified evidence."],
    humanDecisionBoundary: BOUNDARY,
    available: idea.extractedItems.length > 0,
  };
}

export function buildMeasurementPassportReport(idea: SmartIdea): ResearchCanvasReport {
  const passports = loadMeasurementPassports(idea.id);
  return {
    id: `rc-report-${Date.now()}`,
    kind: "Measurement Passport Report",
    title: `Measurement Passports — ${idea.title}`,
    generatedAt: new Date().toISOString(),
    scope: `smartIdea:${idea.id}`,
    sections: passports.map((p) => ({
      heading: p.measurand,
      body: `Result: ${p.result} ${p.unit}\nUncertainty: ${p.uncertainty || p.uncertaintyLimitation}\nMethod: ${p.methodId}\nValidation: ${p.validationStatus}`,
    })),
    limitations: ["Calculations and image measurements are not automatic experimental validation."],
    humanDecisionBoundary: BOUNDARY,
    available: passports.length > 0,
  };
}

export function buildResearchLandscapeReport(idea: SmartIdea): ResearchCanvasReport {
  const results = loadDiscoveryResults(idea.id);
  const timeline = buildHistoricalTimeline(idea.id);
  return {
    id: `rc-report-${Date.now()}`,
    kind: "Research Landscape Report",
    title: `Research Landscape — ${idea.title}`,
    generatedAt: new Date().toISOString(),
    scope: `smartIdea:${idea.id}`,
    sections: [
      { heading: "Connected records", body: results.map((r) => r.title).join("\n") || "None." },
      { heading: "Timeline", body: timeline.map((t) => `${t.date}: ${t.title}`).join("\n") || "None." },
    ],
    limitations: ["Found in currently connected CBAI sources only.", "No global completeness claim."],
    humanDecisionBoundary: BOUNDARY,
    available: results.length > 0,
  };
}

export function buildDecisionSupportReport(idea: SmartIdea): ResearchCanvasReport {
  const pkg = buildDecisionSupportPackage(idea);
  return {
    id: `rc-report-${Date.now()}`,
    kind: "Decision Support Package",
    title: `Decision Support — ${idea.title}`,
    generatedAt: new Date().toISOString(),
    scope: `smartIdea:${idea.id}`,
    sections: [
      { heading: "FACTS", body: pkg.facts.join("\n") },
      { heading: "USER-CONFIRMED INTERPRETATION", body: pkg.userConfirmedInterpretation.join("\n") || "None confirmed." },
      { heading: "MEASUREMENTS", body: pkg.measurements.join("\n") || "None." },
      { heading: "PRIOR WORK", body: pkg.priorWork.join("\n") || "None connected." },
      { heading: "UNKNOWN", body: pkg.unknown.join("\n") },
      { heading: "OPTIONS", body: pkg.options.join("\n") },
      { heading: "REQUIRED VALIDATION", body: pkg.requiredValidation.join("\n") },
    ],
    limitations: ["Analysis section clearly separated from source-provided facts."],
    humanDecisionBoundary: pkg.humanDecisionBoundary,
    available: true,
  };
}

export function buildMeasurementPlanReport(idea: SmartIdea): ResearchCanvasReport {
  const plans = loadMeasurementPlans(idea.id);
  return {
    id: `rc-report-${Date.now()}`,
    kind: "Measurement Plan",
    title: `Measurement Plan — ${idea.title}`,
    generatedAt: new Date().toISOString(),
    scope: `smartIdea:${idea.id}`,
    sections: plans.map((p) => ({
      heading: p.measurand,
      body: `Purpose: ${p.purpose}\nMethod: ${p.methodId}\nUnit: ${p.unitId}\nCalibration: ${p.calibration}\nState: ${p.state}`,
    })),
    limitations: ["Plan is not a completed measurement."],
    humanDecisionBoundary: BOUNDARY,
    available: plans.length > 0,
  };
}
