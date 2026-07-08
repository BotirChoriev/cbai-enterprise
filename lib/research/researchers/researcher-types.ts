export const RESEARCHER_FUTURE_TYPES = [
  "Professor",
  "Research scientist",
  "Postdoctoral researcher",
  "Doctoral student",
  "Graduate student",
  "Laboratory technician",
  "Clinical researcher",
  "Independent researcher",
  "Government researcher",
  "Industry researcher",
] as const;

export type ResearcherFutureType = (typeof RESEARCHER_FUTURE_TYPES)[number];

export const RESEARCHER_EXPECTED_PROFILE_METADATA = [
  "fullName",
  "affiliation",
  "role",
  "department",
  "country",
  "researchAreas",
  "ORCID",
  "publications",
  "datasets",
  "patents",
  "experiments",
  "laboratories",
  "funding",
  "collaborations",
  "sourceUrl",
] as const;

export type ResearcherExpectedProfileMetadata =
  (typeof RESEARCHER_EXPECTED_PROFILE_METADATA)[number];

export const RESEARCHER_VERIFICATION_SOURCES = [
  "ORCID",
  "University profile",
  "Research institution profile",
  "Government research profile",
  "Publisher author profile",
  "OpenAlex author profile",
  "Crossref contributor metadata",
  "Institutional email verification",
] as const;

export type ResearcherVerificationSource = (typeof RESEARCHER_VERIFICATION_SOURCES)[number];

export type ResearcherLayerSourceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type ResearcherLayerEvidenceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type ResearcherLayer = {
  researcherLayerId: string;
  relatedTopicIds: readonly string[];
  supportedResearcherTypes: readonly ResearcherFutureType[];
  expectedProfileMetadata: readonly ResearcherExpectedProfileMetadata[];
  verificationSources: readonly ResearcherVerificationSource[];
  sourceStatus: ResearcherLayerSourceStatus;
  evidenceStatus: ResearcherLayerEvidenceStatus;
  limitations: readonly string[];
  futureCapabilities: readonly string[];
  humanReviewRequired: boolean;
  version: string;
};

export const RESEARCHER_LAYER_SOURCE_STATUS_LABELS: Record<
  ResearcherLayerSourceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const RESEARCHER_LAYER_EVIDENCE_STATUS_LABELS: Record<
  ResearcherLayerEvidenceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const RESEARCHER_EXPECTED_PROFILE_METADATA_LABELS: Record<
  ResearcherExpectedProfileMetadata,
  string
> = {
  fullName: "Full name",
  affiliation: "Affiliation",
  role: "Role",
  department: "Department",
  country: "Country",
  researchAreas: "Research areas",
  ORCID: "ORCID",
  publications: "Publications",
  datasets: "Datasets",
  patents: "Patents",
  experiments: "Experiments",
  laboratories: "Laboratories",
  funding: "Funding",
  collaborations: "Collaborations",
  sourceUrl: "Source URL",
};

export const RESEARCHER_LAYER_VERSION = "1.0.0";

export const RESEARCHER_LAYER_GLOBAL_LIMITATIONS = [
  "No verified researcher profiles in the catalog",
  "No academic contributor records connected",
  "No affiliation or ORCID verification active",
  "No publication or experiment links to profiles",
  "Human review required before any future researcher reference",
] as const;

export const RESEARCHER_LAYER_FUTURE_CAPABILITIES = [
  "Connect verified researchers and academic contributors when official sources are approved",
  "Retrieve profile metadata from supported verification sources",
  "Link affiliations, research areas, and institutional context to topics",
  "Associate publications, datasets, and experiments with verified profiles",
  "Require human review before any profile supports a decision",
] as const;

export const RESEARCHER_TOPIC_NOT_CONNECTED_MESSAGE =
  "Researcher profiles are not connected yet.";
