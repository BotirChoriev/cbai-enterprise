import type { ResearcherLayer } from "@/lib/research/researchers/researcher-types";
import {
  RESEARCHER_EXPECTED_PROFILE_METADATA,
  RESEARCHER_FUTURE_TYPES,
  RESEARCHER_LAYER_FUTURE_CAPABILITIES,
  RESEARCHER_LAYER_GLOBAL_LIMITATIONS,
  RESEARCHER_LAYER_VERSION,
  RESEARCHER_VERIFICATION_SOURCES,
} from "@/lib/research/researchers/researcher-types";
import { validateResearcherLayerRegistry } from "@/lib/research/researchers/researcher-validation";

const LAYER_VERSION = RESEARCHER_LAYER_VERSION;

/** Readiness-only entries — no actual researcher records. */
export const RESEARCHER_LAYER_REGISTRY: readonly ResearcherLayer[] = [
  {
    researcherLayerId: "researcher-readiness-global",
    relatedTopicIds: [],
    supportedResearcherTypes: RESEARCHER_FUTURE_TYPES,
    expectedProfileMetadata: RESEARCHER_EXPECTED_PROFILE_METADATA,
    verificationSources: RESEARCHER_VERIFICATION_SOURCES,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: RESEARCHER_LAYER_GLOBAL_LIMITATIONS,
    futureCapabilities: RESEARCHER_LAYER_FUTURE_CAPABILITIES,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    researcherLayerId: "researcher-readiness-microbiology",
    relatedTopicIds: ["microbiology"],
    supportedResearcherTypes: RESEARCHER_FUTURE_TYPES,
    expectedProfileMetadata: RESEARCHER_EXPECTED_PROFILE_METADATA,
    verificationSources: RESEARCHER_VERIFICATION_SOURCES,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...RESEARCHER_LAYER_GLOBAL_LIMITATIONS,
      "Laboratory and culture method context referenced — researcher profiles not connected yet",
    ],
    futureCapabilities: [
      ...RESEARCHER_LAYER_FUTURE_CAPABILITIES,
      "Link research scientists and laboratory technicians to microbiology topics when approved",
    ],
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    researcherLayerId: "researcher-readiness-antibiotic-resistance",
    relatedTopicIds: ["antibiotic-resistance"],
    supportedResearcherTypes: RESEARCHER_FUTURE_TYPES,
    expectedProfileMetadata: RESEARCHER_EXPECTED_PROFILE_METADATA,
    verificationSources: RESEARCHER_VERIFICATION_SOURCES,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...RESEARCHER_LAYER_GLOBAL_LIMITATIONS,
      "Clinical and public health research context referenced — profile metadata not available",
    ],
    futureCapabilities: [
      ...RESEARCHER_LAYER_FUTURE_CAPABILITIES,
      "Support clinical researcher and government researcher verification when sources connect",
    ],
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
] as const;

const registryValidation = validateResearcherLayerRegistry(RESEARCHER_LAYER_REGISTRY);

if (!registryValidation.valid) {
  const summary = registryValidation.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Researcher layer registry validation failed: ${summary}`);
}
