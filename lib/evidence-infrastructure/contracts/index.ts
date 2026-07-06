export {
  CBAI_EVIDENCE_MODEL_V1_FIELDS,
  REQUIRED_PROVENANCE_FIELDS,
  ALLOWED_EVIDENCE_VALUE_TYPES,
  DEFAULT_ADAPTER_OUTPUT_OBLIGATION,
  CONNECTOR_SURFACE_CONTRACT,
  type CbaiEvidenceModelContract,
  type AdapterOutputObligation,
  type ConnectorSurfaceContract,
} from "@/lib/evidence-infrastructure/contracts/evidence-model.contract";

export {
  CONNECTOR_CONTRACT_REQUIRED_KEYS,
  CONNECTOR_CONTRACT_SPEC,
} from "@/lib/evidence-infrastructure/contracts/connector.contract";

export {
  ADAPTER_CONTRACT_REQUIRED_KEYS,
  ADAPTER_CONTRACT_SPEC,
  ADAPTER_PIPELINE,
  type AdapterPipelineStage,
} from "@/lib/evidence-infrastructure/contracts/adapter.contract";
