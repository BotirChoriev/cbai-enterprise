import type { AdapterContract } from "@/lib/evidence-infrastructure/types";

export type { AdapterContract };

/** Adapter contract — external structure → CBAI Evidence Model. */
export const ADAPTER_CONTRACT_REQUIRED_KEYS = [
  "adapterId",
  "sourceSlug",
  "title",
  "description",
  "inputFormat",
  "outputSchema",
  "version",
  "normalizersRequired",
] as const satisfies readonly (keyof AdapterContract)[];

export const ADAPTER_CONTRACT_SPEC = {
  adapterId: "Stable adapter identifier",
  sourceSlug: "Bound evidence source slug from registry",
  inputFormat: "Descriptive external format (e.g. WDI CSV, OCDS JSON)",
  outputSchema: "Target CBAI evidence schema version (v1, v2, v3)",
  normalizersRequired: "Normalizer kinds applied in adapter pipeline",
  version: "Adapter semver",
} as const;

/** Adapter pipeline stages — declarative flow, not executed. */
export type AdapterPipelineStage =
  | "ingest"
  | "validate"
  | "normalize"
  | "map-to-evidence-model"
  | "attach-provenance";

export const ADAPTER_PIPELINE: readonly AdapterPipelineStage[] = [
  "ingest",
  "validate",
  "normalize",
  "map-to-evidence-model",
  "attach-provenance",
] as const;
