export const LABORATORY_FUTURE_TYPES = [
  "University laboratory",
  "Government laboratory",
  "Hospital laboratory",
  "Industrial R&D laboratory",
  "Independent research center",
  "Field station",
  "Clinical laboratory",
  "Computational laboratory",
  "Shared core facility",
  "Teaching laboratory",
] as const;

export type LaboratoryFutureType = (typeof LABORATORY_FUTURE_TYPES)[number];

export const LABORATORY_EXPECTED_METADATA_FIELDS = [
  "laboratoryName",
  "institution",
  "country",
  "city",
  "researchAreas",
  "equipment",
  "methods",
  "projects",
  "researchers",
  "experiments",
  "datasets",
  "publications",
  "patents",
  "safetyProtocols",
  "ethicsApproval",
  "certifications",
  "sourceUrl",
] as const;

export type LaboratoryExpectedMetadataField =
  (typeof LABORATORY_EXPECTED_METADATA_FIELDS)[number];

export type LaboratoryLayerSourceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type LaboratoryLayerEvidenceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type LaboratoryLayer = {
  laboratoryLayerId: string;
  relatedTopicIds: readonly string[];
  supportedLabTypes: readonly LaboratoryFutureType[];
  expectedMetadata: readonly LaboratoryExpectedMetadataField[];
  sourceStatus: LaboratoryLayerSourceStatus;
  evidenceStatus: LaboratoryLayerEvidenceStatus;
  limitations: readonly string[];
  futureCapabilities: readonly string[];
  equipmentSupported: boolean;
  safetyEthicsSupported: boolean;
  affiliationSupported: boolean;
  humanReviewRequired: boolean;
  version: string;
};

export const LABORATORY_LAYER_SOURCE_STATUS_LABELS: Record<
  LaboratoryLayerSourceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const LABORATORY_LAYER_EVIDENCE_STATUS_LABELS: Record<
  LaboratoryLayerEvidenceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const LABORATORY_EXPECTED_METADATA_LABELS: Record<
  LaboratoryExpectedMetadataField,
  string
> = {
  laboratoryName: "Laboratory name",
  institution: "Institution",
  country: "Country",
  city: "City",
  researchAreas: "Research areas",
  equipment: "Equipment",
  methods: "Methods",
  projects: "Projects",
  researchers: "Researchers",
  experiments: "Experiments",
  datasets: "Datasets",
  publications: "Publications",
  patents: "Patents",
  safetyProtocols: "Safety protocols",
  ethicsApproval: "Ethics approval",
  certifications: "Certifications",
  sourceUrl: "Source URL",
};

export const LABORATORY_LAYER_VERSION = "1.0.0";

export const LABORATORY_LAYER_GLOBAL_LIMITATIONS = [
  "No live laboratory records in the catalog",
  "No equipment inventories connected",
  "No institutional affiliations connected",
  "No researcher profiles linked to laboratories",
  "No safety or ethics records available",
  "Human review required before any future laboratory claim",
] as const;

export const LABORATORY_LAYER_FUTURE_CAPABILITIES = [
  "Connect laboratory profile feeds when official integrations are approved",
  "Track equipment, projects, methods, and experiments per lab profile",
  "Link datasets, publications, and patents to laboratory records",
  "Document safety protocols, ethics approval, and certifications",
  "Surface affiliations and institutional context when sources connect",
] as const;

export const LABORATORY_TOPIC_NOT_CONNECTED_MESSAGE =
  "Laboratory records are not connected yet.";
