/**
 * Universal knowledge source contract — future integrations enter through this shape.
 * No external feeds are connected or simulated in this sprint.
 */

export type {
  KnowledgeSourceConnectionStatus,
  KnowledgeSourceRecord,
} from "@/lib/intelligence-os/knowledge-brain.types";

/** Catalog-only placeholder when no live source is attached. */
export const KNOWLEDGE_SOURCE_NOT_CONNECTED =
  "External source catalogs are not connected — only device-local and catalog references are available today.";

/** Source type labels for future category registration (not connected). */
export const FUTURE_KNOWLEDGE_SOURCE_TYPES = [
  "peer_reviewed_paper",
  "book",
  "textbook",
  "library_archive",
  "manuscript",
  "technical_report",
  "government_publication",
  "dataset",
  "patent",
  "standard",
  "engineering_documentation",
  "experimental_protocol",
  "case_study",
  "institutional_knowledge",
  "public_agency_report",
] as const;

export type FutureKnowledgeSourceType = (typeof FUTURE_KNOWLEDGE_SOURCE_TYPES)[number];
