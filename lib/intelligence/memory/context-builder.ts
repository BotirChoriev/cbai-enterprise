import type { EntityType } from "@/lib/entity/entity.types";
import type {
  MemoryContext,
  MemoryContextMetadata,
  MemoryEntryRef,
} from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  getMemoryCategoryIds,
  type MemoryCategory,
} from "@/lib/intelligence/memory/categories";

/** Semantic version of the default memory context builder. */
export const MEMORY_CONTEXT_BUILDER_VERSION = "0.1.0-foundation";

/** Stable identifier for audit metadata. */
export const DEFAULT_MEMORY_CONTEXT_BUILDER_ID = "default-memory-context-builder";

/**
 * Extended memory context including registered category taxonomy.
 */
export interface MemoryContextBuildResult extends MemoryContext {
  /** Memory categories registered for future store queries. */
  registeredCategories: MemoryCategory[];
}

/**
 * Contract for the CBAI Memory Context Layer.
 *
 * Assembles {@link MemoryContext} from intelligence request scope and
 * evidence without persistence, browser storage, or external services.
 */
export interface MemoryContextBuilder {
  /**
   * Build memory context for an intelligence run.
   *
   * @param request - Intelligence request envelope
   * @param evidence - Evidence collection from the Evidence Layer
   * @returns Memory context with explicit production status
   */
  build(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<MemoryContextBuildResult>;
}

/**
 * Resolve subject entity types from request scope.
 */
function resolveSubjectEntityTypes(
  request: IntelligenceRequest,
): EntityType[] | undefined {
  if (!request.subjectEntities?.length) {
    return undefined;
  }

  return [...new Set(request.subjectEntities.map((entity) => entity.type))];
}

/**
 * Map future {@link MemoryRecord} items to pipeline {@link MemoryEntryRef} shape.
 *
 * BUILD-027: returns empty array — extension point for store integration.
 */
function mapRecordsToEntryRefs(): MemoryEntryRef[] {
  return [];
}

/**
 * Default memory context builder for the CBAI Intelligence Engine (BUILD-027).
 *
 * Returns disabled context when `includeMemory` is false or missing.
 * Returns empty not-connected context when `includeMemory` is true.
 * No persistence, browser APIs, or storage implementation.
 */
export class DefaultMemoryContextBuilder implements MemoryContextBuilder {
  /**
   * Build memory context based on request flags and evidence scope.
   */
  async build(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<MemoryContextBuildResult> {
    const builtAt = new Date().toISOString();
    const registeredCategories = getMemoryCategoryIds();

    if (request.includeMemory !== true) {
      return this.buildDisabledContext(request, builtAt, registeredCategories);
    }

    return this.buildNotConnectedContext(
      request,
      evidence,
      builtAt,
      registeredCategories,
    );
  }

  /**
   * Memory context when `includeMemory` is false or omitted.
   */
  private buildDisabledContext(
    request: IntelligenceRequest,
    builtAt: string,
    registeredCategories: MemoryCategory[],
  ): MemoryContextBuildResult {
    const metadata: MemoryContextMetadata = {
      builderId: DEFAULT_MEMORY_CONTEXT_BUILDER_ID,
      builderVersion: MEMORY_CONTEXT_BUILDER_VERSION,
      status: "disabled",
      message: "Memory context disabled — request.includeMemory is not true.",
      builtAt,
    };

    return {
      enabled: false,
      entries: [],
      tenantId: request.tenantId,
      subjectEntityTypes: resolveSubjectEntityTypes(request),
      metadata,
      registeredCategories,
    };
  }

  /**
   * Memory context when memory is requested but store is not connected.
   */
  private buildNotConnectedContext(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
    builtAt: string,
    registeredCategories: MemoryCategory[],
  ): MemoryContextBuildResult {
    void evidence;

    const metadata: MemoryContextMetadata = {
      builderId: DEFAULT_MEMORY_CONTEXT_BUILDER_ID,
      builderVersion: MEMORY_CONTEXT_BUILDER_VERSION,
      status: "memory-not-connected",
      message:
        "Memory context requested but memory store is not connected — no persistence reads occur in BUILD-027.",
      builtAt,
    };

    return {
      enabled: true,
      entries: mapRecordsToEntryRefs(),
      tenantId: request.tenantId,
      subjectEntityTypes: resolveSubjectEntityTypes(request),
      metadata,
      registeredCategories,
    };
  }
}

/** Shared default builder singleton used by the intelligence engine pipeline. */
export const defaultMemoryContextBuilder = new DefaultMemoryContextBuilder();
