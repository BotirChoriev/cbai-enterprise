/**
 * CBAI Intelligence Engine — Memory Context Layer (BUILD-027).
 *
 * Framework-only memory context assembly. No persistence, browser storage,
 * databases, external services, or AI model integration.
 *
 * @see docs/build-027-report.md
 */

export {
  DEFAULT_MEMORY_CONTEXT_BUILDER_ID,
  DefaultMemoryContextBuilder,
  defaultMemoryContextBuilder,
  MEMORY_CONTEXT_BUILDER_VERSION,
  type MemoryContextBuildResult,
  type MemoryContextBuilder,
} from "@/lib/intelligence/memory/context-builder";

export {
  getMemoryCategoryDefinition,
  getMemoryCategoryIds,
  LEGACY_MEMORY_ENTRY_CATEGORY_MAP,
  MEMORY_CATEGORY_DEFINITIONS,
  type MemoryCategory,
} from "@/lib/intelligence/memory/categories";

export type {
  MemoryQuery,
  MemoryQueryResult,
  MemoryRecord,
  MemoryStore,
  MemoryStoreProvider,
  MemoryStoreWriter,
} from "@/lib/intelligence/memory/memory-store";
