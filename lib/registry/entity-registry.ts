import type { GlobalRegistry } from "@/lib/registry/types";
import { buildGlobalRegistry } from "@/lib/registry/registry-builder";
import { buildRegistryIndex } from "@/lib/registry/entity-index";

let cachedRegistry: GlobalRegistry | null = null;
let cachedIndex: ReturnType<typeof buildRegistryIndex> | null = null;

/** Unified CBAI entity registry — single read-only source of truth. */
export function getGlobalRegistry(): GlobalRegistry {
  if (!cachedRegistry) {
    cachedRegistry = buildGlobalRegistry();
  }
  return cachedRegistry;
}

/** Indexed registry views for fast lookup. */
export function getRegistryIndex() {
  if (!cachedIndex) {
    cachedIndex = buildRegistryIndex(getGlobalRegistry());
  }
  return cachedIndex;
}

/** Force rebuild — for tests and future migration hooks. */
export function rebuildGlobalRegistry(): GlobalRegistry {
  cachedRegistry = buildGlobalRegistry();
  cachedIndex = buildRegistryIndex(cachedRegistry);
  return cachedRegistry;
}

export function getAllRegistryEntities() {
  return getGlobalRegistry().entities;
}

export function getRegistryEntityCount(): number {
  return getGlobalRegistry().entityCount;
}
