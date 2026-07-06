import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { EvidenceSourceAdapter } from "@/lib/intelligence/evidence/sources";
import {
  defaultDocumentEvidenceMapper,
  type DocumentEvidenceMapper,
} from "@/lib/intelligence/evidence/adapters/document/document-evidence-mapper";
import {
  defaultDocumentResolver,
  type DocumentResolver,
} from "@/lib/intelligence/evidence/adapters/document/document-resolver";
import {
  DOCUMENT_EVIDENCE_ADAPTER_ID,
  DOCUMENT_EVIDENCE_ADAPTER_VERSION,
  DOCUMENT_EVIDENCE_SOURCE_CLASS,
  DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE,
} from "@/lib/intelligence/evidence/adapters/document/types";

/**
 * Document evidence source adapter foundation (BUILD-033).
 *
 * Registered and disabled — returns zero items with explicit not-connected
 * metadata. No fake documents, mock content, or file reading.
 */
export class DocumentEvidenceAdapter implements EvidenceSourceAdapter {
  readonly id = DOCUMENT_EVIDENCE_ADAPTER_ID;
  readonly sourceClass = DOCUMENT_EVIDENCE_SOURCE_CLASS;
  readonly label = "Knowledge Documents";
  readonly description =
    "Indexed document chunks from the Knowledge module — ingestion not connected in BUILD-033.";
  readonly enabled = false;
  readonly version = DOCUMENT_EVIDENCE_ADAPTER_VERSION;

  /** Static status message for registry inspection and future traces. */
  readonly statusMessage = DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE;

  private readonly resolver: DocumentResolver;
  private readonly mapper: DocumentEvidenceMapper;

  constructor(
    resolver: DocumentResolver = defaultDocumentResolver,
    mapper: DocumentEvidenceMapper = defaultDocumentEvidenceMapper,
  ) {
    this.resolver = resolver;
    this.mapper = mapper;
  }

  /**
   * Collect document evidence — zero items while ingestion is not connected.
   */
  collect(request: IntelligenceRequest) {
    const retrievedAt = new Date().toISOString();
    const resolution = this.resolver.resolve(request);
    const items = this.mapper.mapChunks(resolution, { retrievedAt });

    return {
      items,
      warnings: resolution.warnings,
    };
  }
}

/** Factory for registry bootstrap. */
export function createDocumentEvidenceAdapter(): DocumentEvidenceAdapter {
  return new DocumentEvidenceAdapter();
}
