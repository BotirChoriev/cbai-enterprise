import {
  DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE,
  DOCUMENT_INGESTION_NOT_CONNECTED_WARNING,
  type DocumentResolution,
} from "@/lib/intelligence/evidence/adapters/document/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";

/**
 * Resolves indexed knowledge document chunks for an intelligence request.
 *
 * BUILD-033 skeleton — returns empty resolution with explicit not-connected
 * status. No file reads, cloud fetches, or fabricated documents.
 */
export class DocumentResolver {
  /**
   * Resolve document chunks for the given request.
   *
   * Future: query Knowledge module index by request question, subject entities,
   * and tenant scope. BUILD-033 returns zero chunks only.
   */
  resolve(request: IntelligenceRequest): DocumentResolution {
    void request;

    return {
      chunks: [],
      status: "not-connected",
      message: DOCUMENT_INGESTION_NOT_CONNECTED_MESSAGE,
      warnings: [DOCUMENT_INGESTION_NOT_CONNECTED_WARNING],
    };
  }
}

/** Shared default resolver singleton. */
export const defaultDocumentResolver = new DocumentResolver();
