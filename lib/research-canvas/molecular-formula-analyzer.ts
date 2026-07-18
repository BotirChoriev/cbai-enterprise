/**
 * Molecular formula analyzer — structured input only, no photo inference.
 */

/** Standard atomic masses (IUPAC conventional values, simplified for calculator). */
const ATOMIC_MASS: Readonly<Record<string, number>> = {
  H: 1.008,
  He: 4.003,
  Li: 6.94,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Na: 22.99,
  Mg: 24.305,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  K: 39.098,
  Ca: 40.078,
  Fe: 55.845,
};

export type MolecularAnalysisResult = {
  readonly formula: string;
  readonly normalizedFormula: string;
  readonly elementCounts: Readonly<Record<string, number>>;
  readonly totalAtomCount: number;
  readonly molecularMass: number | null;
  readonly parseError?: string | null;
  readonly limitationKeys: readonly string[];
};

const MOLECULAR_LIMITATION_KEYS = [
  "no_structure_inference",
  "no_safety_claims",
  "no_smiles_parser",
] as const;

const FORMULA_PATTERN = /([A-Z][a-z]?)(\d*)/g;

export function parseMolecularFormula(formula: string): MolecularAnalysisResult {
  const limitationKeys = [...MOLECULAR_LIMITATION_KEYS];

  const trimmed = formula.replace(/\s+/g, "");
  if (!trimmed) {
    return {
      formula,
      normalizedFormula: "",
      elementCounts: {},
      totalAtomCount: 0,
      molecularMass: null,
      parseError: "Empty formula.",
      limitationKeys,
    };
  }

  const counts: Record<string, number> = {};
  let match: RegExpExecArray | null;
  let total = 0;
  FORMULA_PATTERN.lastIndex = 0;

  while ((match = FORMULA_PATTERN.exec(trimmed)) !== null) {
    const element = match[1]!;
    const count = match[2] ? Number.parseInt(match[2], 10) : 1;
    if (!ATOMIC_MASS[element]) {
      return {
        formula,
        normalizedFormula: trimmed,
        elementCounts: counts,
        totalAtomCount: total,
        molecularMass: null,
        parseError: `Unknown element: ${element}`,
        limitationKeys,
      };
    }
    counts[element] = (counts[element] ?? 0) + count;
    total += count;
  }

  if (total === 0) {
    return {
      formula,
      normalizedFormula: trimmed,
      elementCounts: {},
      totalAtomCount: 0,
      molecularMass: null,
      parseError: "Could not parse formula.",
      limitationKeys,
    };
  }

  let mass = 0;
  for (const [el, count] of Object.entries(counts)) {
    mass += (ATOMIC_MASS[el] ?? 0) * count;
  }

  const normalized = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([el, c]) => `${el}${c > 1 ? c : ""}`)
    .join("");

  return {
    formula,
    normalizedFormula: normalized,
    elementCounts: counts,
    totalAtomCount: total,
    molecularMass: Number(mass.toFixed(4)),
    parseError: null,
    limitationKeys,
  };
}

export function rejectPhotoChemicalClaim(sourceKind: string): {
  allowed: false;
  reason: string;
} {
  if (sourceKind === "image" || sourceKind === "photo") {
    return {
      allowed: false,
      reason: "Chemical composition cannot be inferred from an ordinary photograph.",
    };
  }
  return {
    allowed: false,
    reason: "Use structured molecular formula input.",
  };
}
