/**
 * Controlled Formula Registry — approved, well-tested formulas only.
 */

import type { DimensionVector } from "@/lib/research-canvas/research-canvas-types";
import { formatDimension } from "@/lib/research-canvas/unit-registry";

export type FormulaRecord = {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly equation: string;
  readonly variableDefinitions: Readonly<Record<string, string>>;
  readonly requiredDimensions: Readonly<Record<string, DimensionVector>>;
  readonly outputDimension: DimensionVector;
  readonly assumptions: readonly string[];
  readonly validRange: string;
  readonly standardReference: string;
  readonly verificationState: "Approved" | "User-Defined";
  readonly limitations: readonly string[];
  readonly compute: (vars: Record<string, number>) => number;
};

const DIMLESS: DimensionVector = {
  time: 0,
  length: 0,
  mass: 0,
  current: 0,
  temperature: 0,
  amount: 0,
  luminous: 0,
};

export const FORMULA_REGISTRY: readonly FormulaRecord[] = [
  {
    id: "rect-area",
    name: "Rectangle area",
    domain: "geometry",
    equation: "A = length × width",
    variableDefinitions: { length: "Length", width: "Width" },
    requiredDimensions: {
      length: { ...DIMLESS, length: 1 },
      width: { ...DIMLESS, length: 1 },
    },
    outputDimension: { ...DIMLESS, length: 2 },
    assumptions: ["Planar rectangle."],
    validRange: "Positive dimensions.",
    standardReference: "Basic geometry",
    verificationState: "Approved",
    limitations: ["Does not account for measurement uncertainty propagation."],
    compute: (v) => v.length! * v.width!,
  },
  {
    id: "circle-area",
    name: "Circle area",
    domain: "geometry",
    equation: "A = π × r²",
    variableDefinitions: { radius: "Radius" },
    requiredDimensions: { radius: { ...DIMLESS, length: 1 } },
    outputDimension: { ...DIMLESS, length: 2 },
    assumptions: ["Perfect circle."],
    validRange: "radius > 0",
    standardReference: "Basic geometry",
    verificationState: "Approved",
    limitations: ["π used as JavaScript Math.PI — not a measured constant."],
    compute: (v) => Math.PI * v.radius! ** 2,
  },
  {
    id: "circle-circumference",
    name: "Circle circumference",
    domain: "geometry",
    equation: "C = 2π × r",
    variableDefinitions: { radius: "Radius" },
    requiredDimensions: { radius: { ...DIMLESS, length: 1 } },
    outputDimension: { ...DIMLESS, length: 1 },
    assumptions: ["Perfect circle."],
    validRange: "radius > 0",
    standardReference: "Basic geometry",
    verificationState: "Approved",
    limitations: [],
    compute: (v) => 2 * Math.PI * v.radius!,
  },
  {
    id: "rect-volume",
    name: "Rectangular volume",
    domain: "geometry",
    equation: "V = length × width × height",
    variableDefinitions: { length: "Length", width: "Width", height: "Height" },
    requiredDimensions: {
      length: { ...DIMLESS, length: 1 },
      width: { ...DIMLESS, length: 1 },
      height: { ...DIMLESS, length: 1 },
    },
    outputDimension: { ...DIMLESS, length: 3 },
    assumptions: ["Right rectangular prism."],
    validRange: "Positive dimensions.",
    standardReference: "Basic geometry",
    verificationState: "Approved",
    limitations: [],
    compute: (v) => v.length! * v.width! * v.height!,
  },
  {
    id: "cylinder-volume",
    name: "Cylinder volume",
    domain: "geometry",
    equation: "V = π × r² × h",
    variableDefinitions: { radius: "Radius", height: "Height" },
    requiredDimensions: {
      radius: { ...DIMLESS, length: 1 },
      height: { ...DIMLESS, length: 1 },
    },
    outputDimension: { ...DIMLESS, length: 3 },
    assumptions: ["Right circular cylinder."],
    validRange: "radius > 0, height > 0",
    standardReference: "Basic geometry",
    verificationState: "Approved",
    limitations: [],
    compute: (v) => Math.PI * v.radius! ** 2 * v.height!,
  },
  {
    id: "pixel-distance",
    name: "Distance from calibrated pixels",
    domain: "image_measurement",
    equation: "distance = pixelLength × (referenceReal / referencePixels)",
    variableDefinitions: {
      pixelLength: "Measured length in pixels",
      referenceReal: "Reference real length",
      referencePixels: "Reference length in pixels",
    },
    requiredDimensions: {
      pixelLength: DIMLESS,
      referenceReal: { ...DIMLESS, length: 1 },
      referencePixels: DIMLESS,
    },
    outputDimension: { ...DIMLESS, length: 1 },
    assumptions: ["Uniform scale across image plane.", "Reference calibration is valid."],
    validRange: "referencePixels > 0",
    standardReference: "Image scale calibration",
    verificationState: "Approved",
    limitations: [
      "Approximate unless calibration and imaging conditions justify stronger language.",
      "Does not replace instrument metrology.",
    ],
    compute: (v) => v.pixelLength! * (v.referenceReal! / v.referencePixels!),
  },
  {
    id: "density",
    name: "Density",
    domain: "physics",
    equation: "ρ = mass / volume",
    variableDefinitions: { mass: "Mass", volume: "Volume" },
    requiredDimensions: {
      mass: { ...DIMLESS, mass: 1 },
      volume: { ...DIMLESS, length: 3 },
    },
    outputDimension: { ...DIMLESS, mass: 1, length: -3 },
    assumptions: ["Uniform density."],
    validRange: "volume > 0",
    standardReference: "ρ = m/V",
    verificationState: "Approved",
    limitations: [],
    compute: (v) => v.mass! / v.volume!,
  },
  {
    id: "speed",
    name: "Speed",
    domain: "physics",
    equation: "v = distance / time",
    variableDefinitions: { distance: "Distance", time: "Time" },
    requiredDimensions: {
      distance: { ...DIMLESS, length: 1 },
      time: { ...DIMLESS, time: 1 },
    },
    outputDimension: { ...DIMLESS, length: 1, time: -1 },
    assumptions: ["Average speed over interval."],
    validRange: "time > 0",
    standardReference: "v = d/t",
    verificationState: "Approved",
    limitations: [],
    compute: (v) => v.distance! / v.time!,
  },
  {
    id: "mean",
    name: "Arithmetic mean",
    domain: "statistics",
    equation: "mean = sum(values) / n",
    variableDefinitions: { values: "Comma-separated values", n: "Count" },
    requiredDimensions: { values: DIMLESS, n: DIMLESS },
    outputDimension: DIMLESS,
    assumptions: ["All values share compatible units when applied to measurements."],
    validRange: "n > 0",
    standardReference: "Descriptive statistics",
    verificationState: "Approved",
    limitations: ["Not a substitute for inferential statistics."],
    compute: (v) => v.sum! / v.n!,
  },
  {
    id: "stddev",
    name: "Standard deviation (sample)",
    domain: "statistics",
    equation: "s = sqrt(Σ(x-x̄)² / (n-1))",
    variableDefinitions: { sumSqDev: "Sum of squared deviations", n: "Sample size" },
    requiredDimensions: { sumSqDev: DIMLESS, n: DIMLESS },
    outputDimension: DIMLESS,
    assumptions: ["Sample standard deviation with n > 1."],
    validRange: "n > 1",
    standardReference: "Sample standard deviation",
    verificationState: "Approved",
    limitations: ["Requires precomputed sum of squared deviations."],
    compute: (v) => Math.sqrt(v.sumSqDev! / (v.n! - 1)),
  },
] as const;

export function getFormula(id: string): FormulaRecord | null {
  return FORMULA_REGISTRY.find((f) => f.id === id) ?? null;
}

export function validateFormulaDimensions(
  formula: FormulaRecord,
  variables: Record<string, number>,
): { ok: boolean; reason?: string } {
  for (const key of Object.keys(formula.variableDefinitions)) {
    if (!(key in variables) && key !== "values") {
      return { ok: false, reason: `Missing variable: ${key}` };
    }
  }
  return { ok: true };
}

export function describeFormulaOutput(formula: FormulaRecord): string {
  return formatDimension(formula.outputDimension);
}
