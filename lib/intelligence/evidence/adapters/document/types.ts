import type { EntityType } from "@/lib/entity/entity.types";

/** Stable adapter identifier — matches evidence source registry entry. */
export const DOCUMENT_EVIDENCE_ADAPTER_ID = "document";

/** Semantic version of the document evidence adapter foundation. */
export const DOCUMENT_EVIDENCE_ADAPTER_VERSION = "0.1.0-document-foundation";

/** Evidence source class for document-derived items. */
export const DOCUMENT_EVIDENCE_SOURCE_CLASS = "document" as const;

/**
 * Production status for document evidence resolution (BUILD-033).
 */
export type DocumentResolutionStatus =
  | "not-connected"
  | "ready";

/** Human-readable message when document ingestion is not connected. */
export const DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE =
  "Knowledge document ingestion is not connected — no file reads, cloud fetches, or browser storage access occur in BUILD-033.";

/** Warning code emitted when document evidence cannot be collected. */
export const DOCUMENT_INGESTION_NOT_CONNECTED_WARNING =
  "document:ingestion-not-connected";

/**
 * Supported document formats for future ingestion (not active in BUILD-033).
 */
export type SupportedDocumentFormat = "pdf" | "csv" | "txt";

export const FUTURE_SUPPORTED_DOCUMENT_FORMATS: readonly SupportedDocumentFormat[] = [
  "pdf",
  "csv",
  "txt",
];

/**
 * Reference to an indexed knowledge document chunk (future state).
 */
export interface DocumentChunkRef {
  /** Stable document identifier in the Knowledge module. */
  documentId: string;
  /** Chunk identifier within the document index. */
  chunkId: string;
  /** Optional entity scope binding. */
  entityId?: string;
  entityType?: EntityType;
  /** Original filename when ingested. */
  filename?: string;
  /** Document format. */
  format?: SupportedDocumentFormat;
}

/**
 * A resolved document chunk ready for evidence mapping (future state).
 */
export interface ResolvedDocumentChunk {
  ref: DocumentChunkRef;
  /** Verbatim excerpt text from indexed chunk — never fabricated. */
  excerpt: string;
  /** Relevance to active request scope, 0–100. */
  relevance: number;
}

/**
 * Output of {@link DocumentResolver.resolve} (BUILD-033 skeleton).
 */
export interface DocumentResolution {
  /** Resolved document chunks — empty while ingestion is not connected. */
  chunks: ResolvedDocumentChunk[];
  /** Resolution status. */
  status: DocumentResolutionStatus;
  /** Human-readable outcome message for traces and metadata. */
  message: string;
  /** Non-fatal warnings. */
  warnings: string[];
}

/** Options for {@link DocumentEvidenceMapper} (future state). */
export interface DocumentEvidenceMapperOptions {
  retrievedAt: string;
}
