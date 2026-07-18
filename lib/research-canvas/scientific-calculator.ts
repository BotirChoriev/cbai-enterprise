/**
 * Controlled scientific calculator — approved formulas only unless user-defined.
 */

import { getFormula, validateFormulaDimensions } from "@/lib/research-canvas/formula-registry";
import type { CalculationRecord } from "@/lib/research-canvas/research-canvas-types";
import { genesisId } from "@/lib/genesis/genesis-storage";

const SOFTWARE_VERSION = "cbai-research-canvas/1.0";

export type CalculationInput = {
  smartIdeaId: string;
  formulaId: string;
  variables: Record<string, number>;
  variableUnits?: Record<string, string>;
  assumptions?: string[];
  significantFigures?: number;
  userDefinedFormula?: {
    name: string;
    equation: string;
    compute: (vars: Record<string, number>) => number;
  };
};

export type CalculationOutput =
  | { ok: true; record: CalculationRecord }
  | { ok: false; reason: string };

export function runCalculation(input: CalculationInput): CalculationOutput {
  const sigFigs = input.significantFigures ?? 6;

  if (input.userDefinedFormula) {
    const result = input.userDefinedFormula.compute(input.variables);
    if (!Number.isFinite(result)) {
      return { ok: false, reason: "Calculation produced non-finite result." };
    }
    return {
      ok: true,
      record: {
        id: genesisId("calc"),
        smartIdeaId: input.smartIdeaId,
        formulaId: "user-defined",
        formulaName: input.userDefinedFormula.name,
        formulaSource: input.userDefinedFormula.equation,
        isUserDefined: true,
        variables: Object.fromEntries(
          Object.entries(input.variables).map(([k, v]) => [
            k,
            { value: v, unit: input.variableUnits?.[k] ?? "—" },
          ]),
        ),
        assumptions: [
          ...(input.assumptions ?? []),
          "User-defined formula — requires human confirmation.",
        ],
        result: Number(result.toPrecision(sigFigs)),
        resultUnit: "—",
        significantFigures: sigFigs,
        uncertainty: null,
        limitations: [
          "User-defined formula is not validated.",
          "Not an experimental result.",
        ],
        timestamp: new Date().toISOString(),
      },
    };
  }

  const formula = getFormula(input.formulaId);
  if (!formula) return { ok: false, reason: "Formula not in approved registry." };

  const dimCheck = validateFormulaDimensions(formula, input.variables);
  if (!dimCheck.ok) return { ok: false, reason: dimCheck.reason ?? "Dimension validation failed." };

  if (input.formulaId === "mean" && "values" in input.variables === false) {
    return { ok: false, reason: "Mean requires sum and n variables." };
  }

  let result: number;
  try {
    result = formula.compute(input.variables);
  } catch {
    return { ok: false, reason: "Formula computation failed — check inputs." };
  }

  if (!Number.isFinite(result)) {
    return { ok: false, reason: "Non-finite result." };
  }

  return {
    ok: true,
    record: {
      id: genesisId("calc"),
      smartIdeaId: input.smartIdeaId,
      formulaId: formula.id,
      formulaName: formula.name,
      formulaSource: formula.standardReference,
      isUserDefined: false,
      variables: Object.fromEntries(
        Object.entries(input.variables).map(([k, v]) => [
          k,
          { value: v, unit: input.variableUnits?.[k] ?? "—" },
        ]),
      ),
      assumptions: [...formula.assumptions, ...(input.assumptions ?? [])],
      result: Number(result.toPrecision(sigFigs)),
      resultUnit: "see formula output dimension",
      significantFigures: sigFigs,
      uncertainty: null,
      limitations: [
        ...formula.limitations,
        `Software: ${SOFTWARE_VERSION}`,
        "Calculation is not an experimental result.",
      ],
      timestamp: new Date().toISOString(),
    },
  };
}

export function computeMean(values: number[]): { sum: number; n: number; mean: number } {
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  return { sum, n, mean: n > 0 ? sum / n : 0 };
}

export function computeSampleStdDev(values: number[]): number {
  if (values.length < 2) return NaN;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sumSqDev = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  return Math.sqrt(sumSqDev / (values.length - 1));
}

export { SOFTWARE_VERSION };
