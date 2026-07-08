export const PUBLICATION_FUTURE_SOURCE_TYPES = [
  "PubMed",
  "Crossref",
  "OpenAlex",
  "Semantic Scholar",
  "arXiv",
  "DOAJ",
  "Google Scholar",
  "University repositories",
  "Publisher APIs",
] as const;

export type PublicationFutureSourceType = (typeof PUBLICATION_FUTURE_SOURCE_TYPES)[number];

export const PUBLICATION_EXPECTED_METADATA_FIELDS = [
  "title",
  "authors",
  "affiliations",
  "abstract",
  "journal",
  "publicationDate",
  "doi",
  "keywords",
  "methods",
  "datasets",
  "funding",
  "citations",
  "license",
  "sourceUrl",
] as const;

export type PublicationExpectedMetadataField =
  (typeof PUBLICATION_EXPECTED_METADATA_FIELDS)[number];

export type PublicationLayerSourceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type PublicationLayerEvidenceStatus =
  | "source_not_connected"
  | "metadata_not_available"
  | "future_integration_required";

export type PublicationLayer = {
  publicationLayerId: string;
  relatedTopicIds: readonly string[];
  supportedSourceTypes: readonly PublicationFutureSourceType[];
  expectedMetadata: readonly PublicationExpectedMetadataField[];
  sourceStatus: PublicationLayerSourceStatus;
  evidenceStatus: PublicationLayerEvidenceStatus;
  limitations: readonly string[];
  futureCapabilities: readonly string[];
  humanReviewRequired: boolean;
  version: string;
};

export const PUBLICATION_LAYER_SOURCE_STATUS_LABELS: Record<
  PublicationLayerSourceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const PUBLICATION_LAYER_EVIDENCE_STATUS_LABELS: Record<
  PublicationLayerEvidenceStatus,
  string
> = {
  source_not_connected: "Source not connected",
  metadata_not_available: "Metadata not available",
  future_integration_required: "Future integration required",
};

export const PUBLICATION_EXPECTED_METADATA_LABELS: Record<
  PublicationExpectedMetadataField,
  string
> = {
  title: "Title",
  authors: "Authors",
  affiliations: "Affiliations",
  abstract: "Abstract",
  journal: "Journal",
  publicationDate: "Publication date",
  doi: "DOI",
  keywords: "Keywords",
  methods: "Methods",
  datasets: "Datasets",
  funding: "Funding",
  citations: "Citations",
  license: "License",
  sourceUrl: "Source URL",
};

export const PUBLICATION_LAYER_VERSION = "1.0.0";

export const PUBLICATION_LAYER_GLOBAL_LIMITATIONS = [
  "No live publication records in the catalog",
  "No author profiles connected",
  "No journal feeds connected",
  "No citation metrics available",
  "No DOI resolution active",
  "Human review required before any future publication claim",
] as const;

export const PUBLICATION_LAYER_FUTURE_CAPABILITIES = [
  "Connect scientific database feeds when official integrations are approved",
  "Retrieve publication metadata from supported source types",
  "Link research literature to topic pages and evidence discussions",
  "Surface methods and datasets referenced in publications",
  "Track source status and evidence connection per topic",
] as const;

export const PUBLICATION_TOPIC_NOT_CONNECTED_MESSAGE =
  "Publication sources are not connected yet.";
