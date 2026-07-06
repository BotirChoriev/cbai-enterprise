/**
 * Document evidence adapter package (BUILD-033).
 *
 * Disabled foundation — no ingestion, file reads, or fabricated documents.
 *
 * @see docs/build-033-report.md
 */

export {
  createDocumentEvidenceAdapter,
  DocumentEvidenceAdapter,
} from "@/lib/intelligence/evidence/adapters/document/document-evidence-adapter";

export {
  defaultDocumentEvidenceMapper,
  DocumentEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/document/document-evidence-mapper";

export {
  defaultDocumentResolver,
  DocumentResolver,
} from "@/lib/intelligence/evidence/adapters/document/document-resolver";

export {
  DOCUMENT_EVIDENCE_ADAPTER_ID,
  DOCUMENT_EVIDENCE_ADAPTER_VERSION,
  DOCUMENT_EVIDENCE_SOURCE_CLASS,
  DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE,
  DOCUMENT_INGESTION_NOT_CONNECTED_WARNING,
  FUTURE_SUPPORTED_DOCUMENT_FORMATS,
  type DocumentChunkRef,
  type DocumentEvidenceMapperOptions,
  type DocumentResolution,
  type DocumentResolutionStatus,
  type ResolvedDocumentChunk,
  type SupportedDocumentFormat,
} from "@/lib/intelligence/evidence/adapters/document/types";
