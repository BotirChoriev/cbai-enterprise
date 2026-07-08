import type { ResearchEntity } from "@/lib/research/entities/research-entity-types";
import { RESEARCH_ENTITY_MODEL_VERSION } from "@/lib/research/entities/research-entity-types";
import { validateResearchEntityRegistry } from "@/lib/research/entities/research-entity-validation";

const SEED_VERSION = RESEARCH_ENTITY_MODEL_VERSION;

export const RESEARCH_ENTITY_REGISTRY: readonly ResearchEntity[] = [
  {
    entityId: "re-entity-research-topic-microbiology",
    entityType: "research_topic",
    displayName: "Microbiology",
    description:
      "Catalog research object for the Microbiology topic — available catalog information only.",
    relatedTopicIds: ["microbiology"],
    relatedEntityIds: [
      "re-entity-method-catalog-reference",
      "re-entity-dataset-catalog-reference",
      "re-entity-laboratory-catalog-reference",
    ],
    evidenceStatus: "catalog_available",
    sourceStatus: "catalog_only",
    workspaceStatus: "not_available_yet",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-research-topic-antibiotic-resistance",
    entityType: "research_topic",
    displayName: "Antibiotic resistance",
    description:
      "Catalog research object for the Antibiotic resistance topic — evidence sources not connected yet.",
    relatedTopicIds: ["antibiotic-resistance"],
    relatedEntityIds: [
      "re-entity-method-catalog-reference",
      "re-entity-open-question-catalog-reference",
      "re-entity-negative-result-catalog-reference",
    ],
    evidenceStatus: "evidence_not_connected",
    sourceStatus: "official_source_not_connected",
    workspaceStatus: "future_workspace",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-research-topic-crispr",
    entityType: "research_topic",
    displayName: "CRISPR",
    description:
      "Catalog research object for the CRISPR topic — future workspace planned, not active today.",
    relatedTopicIds: ["crispr"],
    relatedEntityIds: ["re-entity-method-catalog-reference"],
    evidenceStatus: "source_not_connected",
    sourceStatus: "future_source_required",
    workspaceStatus: "future_workspace",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-research-topic-quantum-battery",
    entityType: "research_topic",
    displayName: "Quantum battery",
    description:
      "Catalog research object for the Quantum battery topic — catalog profile only.",
    relatedTopicIds: ["quantum-battery"],
    relatedEntityIds: ["re-entity-dataset-catalog-reference"],
    evidenceStatus: "catalog_available",
    sourceStatus: "catalog_only",
    workspaceStatus: "not_available_yet",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-research-topic-plant-disease-resistance",
    entityType: "research_topic",
    displayName: "Plant disease resistance",
    description:
      "Catalog research object for the Plant disease resistance topic — open questions tracked in catalog.",
    relatedTopicIds: ["plant-disease-resistance"],
    relatedEntityIds: [
      "re-entity-method-catalog-reference",
      "re-entity-open-question-catalog-reference",
    ],
    evidenceStatus: "evidence_not_connected",
    sourceStatus: "official_source_not_connected",
    workspaceStatus: "future_workspace",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-method-catalog-reference",
    entityType: "method",
    displayName: "Method",
    description:
      "Generic catalog method reference — not a live protocol record. Human review required before use.",
    relatedTopicIds: [
      "microbiology",
      "antibiotic-resistance",
      "crispr",
      "plant-disease-resistance",
    ],
    relatedEntityIds: [
      "re-entity-research-topic-microbiology",
      "re-entity-research-topic-antibiotic-resistance",
      "re-entity-research-topic-crispr",
      "re-entity-research-topic-plant-disease-resistance",
    ],
    evidenceStatus: "catalog_available",
    sourceStatus: "catalog_only",
    workspaceStatus: "not_available_yet",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-dataset-catalog-reference",
    entityType: "dataset",
    displayName: "Dataset",
    description:
      "Generic catalog dataset reference — official data sources not connected yet.",
    relatedTopicIds: ["microbiology", "quantum-battery"],
    relatedEntityIds: [
      "re-entity-research-topic-microbiology",
      "re-entity-research-topic-quantum-battery",
    ],
    evidenceStatus: "source_not_connected",
    sourceStatus: "official_source_not_connected",
    workspaceStatus: "not_available_yet",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-laboratory-catalog-reference",
    entityType: "laboratory",
    displayName: "Laboratory",
    description:
      "Generic catalog laboratory reference — no institutional records connected.",
    relatedTopicIds: ["microbiology"],
    relatedEntityIds: ["re-entity-research-topic-microbiology"],
    evidenceStatus: "source_not_connected",
    sourceStatus: "future_source_required",
    workspaceStatus: "not_available_yet",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-open-question-catalog-reference",
    entityType: "open_question",
    displayName: "Open question",
    description:
      "Generic catalog open question reference — tracks unresolved areas, not live discussion.",
    relatedTopicIds: ["antibiotic-resistance", "plant-disease-resistance"],
    relatedEntityIds: [
      "re-entity-research-topic-antibiotic-resistance",
      "re-entity-research-topic-plant-disease-resistance",
    ],
    evidenceStatus: "catalog_available",
    sourceStatus: "catalog_only",
    workspaceStatus: "future_workspace",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
  {
    entityId: "re-entity-negative-result-catalog-reference",
    entityType: "negative_result",
    displayName: "Negative result",
    description:
      "Generic catalog negative result reference — documents evidence gaps without live study records.",
    relatedTopicIds: ["antibiotic-resistance"],
    relatedEntityIds: ["re-entity-research-topic-antibiotic-resistance"],
    evidenceStatus: "evidence_not_connected",
    sourceStatus: "official_source_not_connected",
    workspaceStatus: "not_available_yet",
    humanReviewRequired: true,
    version: SEED_VERSION,
  },
] as const;

const registryValidation = validateResearchEntityRegistry(RESEARCH_ENTITY_REGISTRY);

if (!registryValidation.valid) {
  const summary = registryValidation.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Research entity registry validation failed: ${summary}`);
}
