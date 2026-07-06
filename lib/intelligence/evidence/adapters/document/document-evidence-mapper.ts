import type { Evidence } from "@/lib/intelligence/evidence.types";
import {
  DOCUMENT_EVIDENCE_SOURCE_CLASS,
  type DocumentEvidenceMapperOptions,
  type DocumentResolution,
  type ResolvedDocumentChunk,
} from "@/lib/intelligence/evidence/adapters/document/types";

const SOURCE_LABEL = "CBAI Knowledge Documents";

/**
 * Maps resolved document chunks to {@link Evidence} items.
 *
 * BUILD-033 skeleton — returns empty array while ingestion is not connected.
 * Future implementations map verbatim excerpts only — no fabricated content.
 */
export class DocumentEvidenceMapper {
  /**
   * Map resolved document chunks to evidence items.
   */
  mapChunks(
    resolution: DocumentResolution,
    options: DocumentEvidenceMapperOptions,
  ): Evidence[] {
    if (resolution.status !== "ready" || resolution.chunks.length === 0) {
      return [];
    }

    const seenIds = new Set<string>();
    const evidence: Evidence[] = [];

    for (const chunk of resolution.chunks) {
      const item = this.mapChunk(chunk, options);

      if (seenIds.has(item.id)) {
        continue;
      }

      seenIds.add(item.id);
      evidence.push(item);
    }

    return evidence.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Map a single document chunk to evidence (future state).
   */
  private mapChunk(
    chunk: ResolvedDocumentChunk,
    options: DocumentEvidenceMapperOptions,
  ): Evidence {
    const { ref } = chunk;

    return {
      id: `document:${ref.documentId}:${ref.chunkId}`,
      entityId: ref.entityId ?? ref.documentId,
      entityType: ref.entityType ?? "company",
      entityName: ref.filename ?? ref.documentId,
      source: {
        class: DOCUMENT_EVIDENCE_SOURCE_CLASS,
        ref: `${ref.documentId}:${ref.chunkId}`,
        label: SOURCE_LABEL,
        provenanceStrength: "inferred",
        retrievedAt: options.retrievedAt,
      },
      relevance: chunk.relevance,
      excerpt: chunk.excerpt,
      staleness: "fresh",
    };
  }
}

/** Shared default mapper singleton. */
export const defaultDocumentEvidenceMapper = new DocumentEvidenceMapper();
