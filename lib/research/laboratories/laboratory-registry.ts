import type { LaboratoryLayer } from "@/lib/research/laboratories/laboratory-types";
import {
  LABORATORY_EXPECTED_METADATA_FIELDS,
  LABORATORY_FUTURE_TYPES,
  LABORATORY_LAYER_FUTURE_CAPABILITIES,
  LABORATORY_LAYER_GLOBAL_LIMITATIONS,
  LABORATORY_LAYER_VERSION,
} from "@/lib/research/laboratories/laboratory-types";
import { validateLaboratoryLayerRegistry } from "@/lib/research/laboratories/laboratory-validation";

const LAYER_VERSION = LABORATORY_LAYER_VERSION;

/** Readiness-only layer entries — no actual laboratory records. */
export const LABORATORY_LAYER_REGISTRY: readonly LaboratoryLayer[] = [
  {
    laboratoryLayerId: "lab-layer-readiness-global",
    relatedTopicIds: [],
    supportedLabTypes: LABORATORY_FUTURE_TYPES,
    expectedMetadata: LABORATORY_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: LABORATORY_LAYER_GLOBAL_LIMITATIONS,
    futureCapabilities: LABORATORY_LAYER_FUTURE_CAPABILITIES,
    equipmentSupported: true,
    safetyEthicsSupported: true,
    affiliationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    laboratoryLayerId: "lab-layer-readiness-microbiology",
    relatedTopicIds: ["microbiology"],
    supportedLabTypes: LABORATORY_FUTURE_TYPES,
    expectedMetadata: LABORATORY_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...LABORATORY_LAYER_GLOBAL_LIMITATIONS,
      "Laboratory records listed in catalog — lab profile feeds not connected yet",
    ],
    futureCapabilities: [
      ...LABORATORY_LAYER_FUTURE_CAPABILITIES,
      "Support university and shared core facility profiles for culture methods when sources connect",
    ],
    equipmentSupported: true,
    safetyEthicsSupported: true,
    affiliationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    laboratoryLayerId: "lab-layer-readiness-antibiotic-resistance",
    relatedTopicIds: ["antibiotic-resistance"],
    supportedLabTypes: LABORATORY_FUTURE_TYPES,
    expectedMetadata: LABORATORY_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...LABORATORY_LAYER_GLOBAL_LIMITATIONS,
      "Clinical and public health laboratory context referenced — lab metadata not available",
    ],
    futureCapabilities: [
      ...LABORATORY_LAYER_FUTURE_CAPABILITIES,
      "Support hospital and clinical laboratory profiles when institutional sources connect",
    ],
    equipmentSupported: true,
    safetyEthicsSupported: true,
    affiliationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    laboratoryLayerId: "lab-layer-readiness-crispr",
    relatedTopicIds: ["crispr"],
    supportedLabTypes: LABORATORY_FUTURE_TYPES,
    expectedMetadata: LABORATORY_EXPECTED_METADATA_FIELDS,
    sourceStatus: "future_integration_required",
    evidenceStatus: "future_integration_required",
    limitations: [
      ...LABORATORY_LAYER_GLOBAL_LIMITATIONS,
      "Gene editing laboratory context referenced in catalog — future integration required",
    ],
    futureCapabilities: [
      ...LABORATORY_LAYER_FUTURE_CAPABILITIES,
      "Support ethics approval and safety protocol metadata for gene editing labs when approved",
    ],
    equipmentSupported: true,
    safetyEthicsSupported: true,
    affiliationSupported: true,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
] as const;

const registryValidation = validateLaboratoryLayerRegistry(LABORATORY_LAYER_REGISTRY);

if (!registryValidation.valid) {
  const summary = registryValidation.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Laboratory layer registry validation failed: ${summary}`);
}
