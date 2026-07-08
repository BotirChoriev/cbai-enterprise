import type { PublicationLayer } from "@/lib/research/publications/publication-types";
import {
  PUBLICATION_EXPECTED_METADATA_FIELDS,
  PUBLICATION_FUTURE_SOURCE_TYPES,
  PUBLICATION_LAYER_FUTURE_CAPABILITIES,
  PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
  PUBLICATION_LAYER_VERSION,
} from "@/lib/research/publications/publication-types";
import { validatePublicationLayerRegistry } from "@/lib/research/publications/publication-validation";

const LAYER_VERSION = PUBLICATION_LAYER_VERSION;

/** Readiness-only layer entries — no actual publication records. */
export const PUBLICATION_LAYER_REGISTRY: readonly PublicationLayer[] = [
  {
    publicationLayerId: "pub-layer-readiness-global",
    relatedTopicIds: [],
    supportedSourceTypes: PUBLICATION_FUTURE_SOURCE_TYPES,
    expectedMetadata: PUBLICATION_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
    futureCapabilities: PUBLICATION_LAYER_FUTURE_CAPABILITIES,
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    publicationLayerId: "pub-layer-readiness-microbiology",
    relatedTopicIds: ["microbiology"],
    supportedSourceTypes: PUBLICATION_FUTURE_SOURCE_TYPES,
    expectedMetadata: PUBLICATION_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
      "Peer-reviewed studies listed in catalog — publication feeds not connected yet",
    ],
    futureCapabilities: [
      ...PUBLICATION_LAYER_FUTURE_CAPABILITIES,
      "Link laboratory records and peer-reviewed studies when sources connect",
    ],
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    publicationLayerId: "pub-layer-readiness-antibiotic-resistance",
    relatedTopicIds: ["antibiotic-resistance"],
    supportedSourceTypes: PUBLICATION_FUTURE_SOURCE_TYPES,
    expectedMetadata: PUBLICATION_EXPECTED_METADATA_FIELDS,
    sourceStatus: "source_not_connected",
    evidenceStatus: "metadata_not_available",
    limitations: [
      ...PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
      "Clinical studies and genomic datasets referenced — publication metadata not available",
    ],
    futureCapabilities: [
      ...PUBLICATION_LAYER_FUTURE_CAPABILITIES,
      "Connect public health reports and clinical study literature when approved",
    ],
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
  {
    publicationLayerId: "pub-layer-readiness-crispr",
    relatedTopicIds: ["crispr"],
    supportedSourceTypes: PUBLICATION_FUTURE_SOURCE_TYPES,
    expectedMetadata: PUBLICATION_EXPECTED_METADATA_FIELDS,
    sourceStatus: "future_integration_required",
    evidenceStatus: "future_integration_required",
    limitations: [
      ...PUBLICATION_LAYER_GLOBAL_LIMITATIONS,
      "Methods papers and patents referenced in catalog — future integration required",
    ],
    futureCapabilities: [
      ...PUBLICATION_LAYER_FUTURE_CAPABILITIES,
      "Integrate methods literature and policy guidance when sources are approved",
    ],
    humanReviewRequired: true,
    version: LAYER_VERSION,
  },
] as const;

const registryValidation = validatePublicationLayerRegistry(PUBLICATION_LAYER_REGISTRY);

if (!registryValidation.valid) {
  const summary = registryValidation.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Publication layer registry validation failed: ${summary}`);
}
