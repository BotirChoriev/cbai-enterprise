import type {
  EntityPipelineReadinessModel,
  PipelineReadinessModel,
  PipelineReadinessState,
  ReportPipelineReadinessModel,
} from "@/lib/pipeline-readiness/pipeline-readiness.types";
import {
  buildPlatformPipelineReadiness,
} from "@/lib/pipeline-readiness/pipeline-readiness-builder";
import {
  buildReportPipelineReadiness,
  buildCountryPipelineReadiness,
  buildCompanyPipelineReadiness,
  buildUniversityPipelineReadiness,
} from "@/lib/pipeline-readiness/pipeline-readiness-summary";
import type { Country } from "@/lib/countries";
import type { Company } from "@/lib/companies";
import type { University } from "@/lib/universities";

/** User-facing status label for pipeline readiness state. */
export function pipelineReadinessStateLabel(state: PipelineReadinessState): string {
  switch (state) {
    case "ready":
      return "Validation readiness";
    case "partial":
      return "Partial readiness";
    case "planned":
      return "Source readiness planned";
    case "blocked":
      return "Blocked";
  }
}

export function pipelineReadinessStatusClass(state: PipelineReadinessState): string {
  switch (state) {
    case "ready":
      return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case "partial":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "planned":
      return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "blocked":
      return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
  }
}

export function getPlatformPipelineReadiness(): PipelineReadinessModel {
  return buildPlatformPipelineReadiness();
}

export function getReportPipelineReadiness(): ReportPipelineReadinessModel {
  return buildReportPipelineReadiness();
}

export function getCountryPipelineReadiness(country: Country): EntityPipelineReadinessModel {
  return buildCountryPipelineReadiness(country);
}

export function getCompanyPipelineReadiness(company: Company): EntityPipelineReadinessModel {
  return buildCompanyPipelineReadiness(company);
}

export function getUniversityPipelineReadiness(
  university: University,
): EntityPipelineReadinessModel {
  return buildUniversityPipelineReadiness(university);
}
