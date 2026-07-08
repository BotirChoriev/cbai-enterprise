export {
  RESEARCHER_FUTURE_TYPES,
  RESEARCHER_EXPECTED_PROFILE_METADATA,
  RESEARCHER_VERIFICATION_SOURCES,
  RESEARCHER_LAYER_SOURCE_STATUS_LABELS,
  RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS,
  RESEARCHER_EXPECTED_PROFILE_METADATA_LABELS,
  RESEARCHER_LAYER_VERSION,
  RESEARCHER_LAYER_GLOBAL_LIMITATIONS,
  RESEARCHER_LAYER_FUTURE_CAPABILITIES,
  RESEARCHER_TOPIC_NOT_CONNECTED_MESSAGE,
  type ResearcherFutureType,
  type ResearcherExpectedProfileMetadata,
  type ResearcherVerificationSource,
  type ResearcherLayerSourceStatus,
  type ResearcherLayerEvidenceStatus,
  type ResearcherLayer,
} from "@/lib/research/researchers/researcher-types";

export { RESEARCHER_LAYER_REGISTRY } from "@/lib/research/researchers/researcher-registry";

export {
  findResearcherLayerById,
  findResearcherLayerByTopic,
  listResearcherTypes,
  listExpectedProfileMetadataFields,
  listVerificationSources,
  getResearcherReadinessForTopic,
  listResearcherLayers,
  getDefaultResearcherLimitations,
  getDefaultResearcherFutureCapabilities,
  type ResearcherTopicReadiness,
} from "@/lib/research/researchers/researcher-query";

export {
  validateResearcherLayerRegistry,
  isValidResearcherLayerSourceStatus,
  isValidResearcherLayerEvidenceStatus,
  type ResearcherLayerValidationIssue,
  type ResearcherLayerValidationReport,
} from "@/lib/research/researchers/researcher-validation";
