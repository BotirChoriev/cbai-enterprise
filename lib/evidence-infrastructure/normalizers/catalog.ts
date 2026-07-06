import type { NormalizerDefinition } from "@/lib/evidence-infrastructure/types";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";

function defineNormalizer(
  input: Omit<NormalizerDefinition, "version">,
): NormalizerDefinition {
  return { ...input, version: INFRASTRUCTURE_VERSION };
}

/** Canonical normalizers — convert external values to CBAI standard form. */
export const NORMALIZER_CATALOG: readonly NormalizerDefinition[] = [
  defineNormalizer({
    id: "norm-date-iso8601",
    kind: "date",
    title: "ISO 8601 Date Normalizer",
    description:
      "Converts heterogeneous date strings to ISO 8601 UTC dates for evidence timestamps.",
    inputExamples: ["2024-03-15", "15/03/2024", "March 15, 2024"],
    outputFormat: "YYYY-MM-DD or ISO 8601 datetime",
    standardReference: "ISO 8601",
  }),
  defineNormalizer({
    id: "norm-unit-si",
    kind: "unit",
    title: "SI Unit Normalizer",
    description:
      "Maps common unit variants to SI-aligned labels for numeric evidence values.",
    inputExamples: ["USD mn", "million USD", "thousand tonnes"],
    outputFormat: "number + canonical unit string (USD, tonnes, percent as 0-100)",
    standardReference: "SI Brochure",
  }),
  defineNormalizer({
    id: "norm-country-iso3166",
    kind: "country-code",
    title: "ISO 3166 Country Code Normalizer",
    description:
      "Maps country names and alpha-3 codes to ISO 3166-1 alpha-2 for entity binding.",
    inputExamples: ["USA", "United States", "US", "840"],
    outputFormat: "ISO 3166-1 alpha-2 (e.g. US, UZ, DE)",
    standardReference: "ISO 3166-1",
  }),
  defineNormalizer({
    id: "norm-language-iso639",
    kind: "language",
    title: "ISO 639 Language Normalizer",
    description:
      "Normalizes language identifiers for document and metadata evidence.",
    inputExamples: ["eng", "English", "en-US"],
    outputFormat: "ISO 639-1 (e.g. en, uz, de)",
    standardReference: "ISO 639-1",
  }),
  defineNormalizer({
    id: "norm-currency-iso4217",
    kind: "currency",
    title: "ISO 4217 Currency Normalizer",
    description:
      "Maps currency symbols and names to ISO 4217 codes for financial evidence.",
    inputExamples: ["$", "USD", "US Dollar", "som"],
    outputFormat: "ISO 4217 alpha-3 (e.g. USD, UZS, EUR)",
    standardReference: "ISO 4217",
  }),
  defineNormalizer({
    id: "norm-classification-isic",
    kind: "classification",
    title: "ISIC Industry Classification Normalizer",
    description:
      "Maps industry sector strings to ISIC Rev.4 codes for company and industry evidence.",
    inputExamples: ["Technology", "C26", "Computer manufacturing"],
    outputFormat: "ISIC Rev.4 code",
    standardReference: "UN ISIC Rev.4",
  }),
  defineNormalizer({
    id: "norm-classification-isced",
    kind: "classification",
    title: "ISCED Education Level Normalizer",
    description:
      "Maps education level descriptions to ISCED 2011 codes for enrollment evidence.",
    inputExamples: ["tertiary", "bachelor", "ISCED 6"],
    outputFormat: "ISCED 2011 level code",
    standardReference: "UNESCO ISCED 2011",
  }),
] as const;

export function getNormalizerByKind(
  kind: NormalizerDefinition["kind"],
): NormalizerDefinition[] {
  return NORMALIZER_CATALOG.filter((n) => n.kind === kind);
}

export function getNormalizerById(id: string): NormalizerDefinition | undefined {
  return NORMALIZER_CATALOG.find((n) => n.id === id);
}
