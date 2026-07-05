/**
 * Memory category taxonomy for the CBAI Memory Context Layer (BUILD-027).
 *
 * Defines organizational memory classes that future persistence backends
 * will store and query — distinct from the Knowledge module document corpus.
 */
export type MemoryCategory =
  | "conversation"
  | "entity"
  | "knowledge"
  | "reasoning"
  | "agent"
  | "preference"
  | "session"
  | "future";

/** Canonical memory category definitions for governance and UI surfaces. */
export const MEMORY_CATEGORY_DEFINITIONS: readonly {
  id: MemoryCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "conversation",
    label: "Conversation",
    description: "Thread history and discourse context linked to entities.",
  },
  {
    id: "entity",
    label: "Entity",
    description: "Watchlists, pinned entities, and entity-scoped operational notes.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    description: "Pinned documents and corpus references — not raw file storage.",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    description: "Saved intelligence products and reasoning trace references.",
  },
  {
    id: "agent",
    label: "Agent",
    description: "Agent task history and delegated work context.",
  },
  {
    id: "preference",
    label: "Preference",
    description: "User and tenant preferences affecting intelligence routing.",
  },
  {
    id: "session",
    label: "Session",
    description: "Ephemeral session-scoped context for the active intelligence run.",
  },
  {
    id: "future",
    label: "Future",
    description: "Reserved category for forward-compatible memory expansion.",
  },
];

/**
 * Legacy {@link MemoryEntryCategory} values mapped to BUILD-027 taxonomy.
 *
 * Used when bridging CBAI Core mock memory to the intelligence layer.
 */
export const LEGACY_MEMORY_ENTRY_CATEGORY_MAP: Record<
  import("@/lib/intelligence/context.types").MemoryEntryCategory,
  MemoryCategory
> = {
  "pinned-knowledge": "knowledge",
  conversation: "conversation",
  "saved-command": "preference",
  watchlist: "entity",
  "saved-intelligence": "reasoning",
  "reasoning-trace": "reasoning",
};

/**
 * Returns all registered memory category IDs.
 */
export function getMemoryCategoryIds(): MemoryCategory[] {
  return MEMORY_CATEGORY_DEFINITIONS.map((definition) => definition.id);
}

/**
 * Lookup a memory category definition by ID.
 */
export function getMemoryCategoryDefinition(category: MemoryCategory) {
  return MEMORY_CATEGORY_DEFINITIONS.find((definition) => definition.id === category);
}
