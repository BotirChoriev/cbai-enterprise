import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";
import {
  buildEvidenceComparisonModel,
  defaultComparisonTarget,
} from "@/lib/evidence-comparison/comparison-builder";
import type {
  ComparisonReadinessStatus,
  EvidenceComparisonModel,
} from "@/lib/evidence-comparison/comparison-types";

export function getCountryEvidenceComparison(
  country: Country,
  compareWithLegacyId?: string | null,
): EvidenceComparisonModel {
  const target = compareWithLegacyId ?? defaultComparisonTarget(
    buildEvidenceComparisonModel("country", country.id, null).context,
  )?.legacyId ?? null;
  return buildEvidenceComparisonModel("country", country.id, target);
}

export function getCompanyEvidenceComparison(
  company: Company,
  compareWithLegacyId?: string | null,
): EvidenceComparisonModel {
  const target = compareWithLegacyId ?? defaultComparisonTarget(
    buildEvidenceComparisonModel("company", company.id, null).context,
  )?.legacyId ?? null;
  return buildEvidenceComparisonModel("company", company.id, target);
}

export function getUniversityEvidenceComparison(
  university: University,
  compareWithLegacyId?: string | null,
): EvidenceComparisonModel {
  const target = compareWithLegacyId ?? defaultComparisonTarget(
    buildEvidenceComparisonModel("university", university.id, null).context,
  )?.legacyId ?? null;
  return buildEvidenceComparisonModel("university", university.id, target);
}

export function comparisonReadinessLabel(status: ComparisonReadinessStatus): string {
  switch (status) {
    case "comparable":
      return "Comparable — shared indicators mapped with evidence readiness disclosed";
    case "partial":
      return "Partial — evidence connection posture differs between entities";
    case "insufficient_evidence":
      return "Insufficient evidence — no connected evidence on either entity";
    case "unsupported":
      return "Unsupported comparison";
  }
}

export function comparisonReadinessStatusClass(status: ComparisonReadinessStatus): string {
  switch (status) {
    case "comparable":
      return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case "partial":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "insufficient_evidence":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
    case "unsupported":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
}

export function comparisonNoteClass(note: string): string {
  if (note.includes("same evidence")) return "text-zinc-400";
  if (note.includes("more evidence connected")) return "text-teal-400";
  return "text-violet-400";
}
