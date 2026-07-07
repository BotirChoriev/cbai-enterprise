import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";
import {
  buildCountryEvidenceGapProfile,
  buildCompanyEvidenceGapProfile,
  buildUniversityEvidenceGapProfile,
} from "@/lib/evidence-gap/gap-builder";
import type { EntityEvidenceGapProfile } from "@/lib/evidence-gap/gap-types";

export function getCountryEvidenceGaps(country: Country): EntityEvidenceGapProfile {
  return buildCountryEvidenceGapProfile(country);
}

export function getCompanyEvidenceGaps(company: Company): EntityEvidenceGapProfile {
  return buildCompanyEvidenceGapProfile(company);
}

export function getUniversityEvidenceGaps(university: University): EntityEvidenceGapProfile {
  return buildUniversityEvidenceGapProfile(university);
}

export function gapStatusLabel(status: EntityEvidenceGapProfile["gaps"][number]["currentStatus"]): string {
  switch (status) {
    case "available":
      return "Available now";
    case "planned":
      return "Not yet available";
    case "missing":
      return "Missing";
    case "blocked":
      return "Unavailable";
  }
}

export function gapStatusClass(status: EntityEvidenceGapProfile["gaps"][number]["currentStatus"]): string {
  switch (status) {
    case "available":
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "planned":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "missing":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
    case "blocked":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
}

/** Gaps that are not available — primary transparency focus. */
export function getNonAvailableGaps(
  profile: EntityEvidenceGapProfile,
): EntityEvidenceGapProfile["gaps"] {
  return profile.gaps.filter((gap) => gap.currentStatus !== "available");
}

/** Gaps with connected evidence — what exists today. */
export function getAvailableGaps(
  profile: EntityEvidenceGapProfile,
): EntityEvidenceGapProfile["gaps"] {
  return profile.gaps.filter((gap) => gap.currentStatus === "available");
}
