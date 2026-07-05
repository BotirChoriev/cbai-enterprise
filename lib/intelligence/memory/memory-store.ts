import type { MemoryCategory } from "@/lib/intelligence/memory/categories";

/**
 * A single memory record retrieved from organizational memory.
 *
 * Interface only — no persistence implementation in BUILD-027.
 */
export interface MemoryRecord {
  /** Stable memory record identifier. */
  id: string;
  /** Memory category taxonomy class. */
  category: MemoryCategory;
  /** Display title for traces and explainability. */
  title: string;
  /** Linked entity IDs — required by Constitution §11.3 rule M8. */
  entityIds: string[];
  /** Linked document IDs when referencing knowledge corpus items. */
  documentIds?: string[];
  /** Optional tenant scope identifier. */
  tenantId?: string;
  /** Optional conversation thread identifier. */
  conversationId?: string;
  /** ISO-8601 timestamp when the record was created. */
  createdAt: string;
  /** ISO-8601 timestamp when the record was last updated. */
  updatedAt?: string;
}

/**
 * Query parameters for reading organizational memory.
 *
 * Interface only — future backends implement filtering and pagination.
 */
export interface MemoryQuery {
  /** Tenant scope for multi-tenant isolation. */
  tenantId?: string;
  /** Filter to specific memory categories. */
  categories?: MemoryCategory[];
  /** Filter to records linked to any of these entity IDs. */
  entityIds?: string[];
  /** Filter to a specific conversation thread. */
  conversationId?: string;
  /** Maximum records to return. */
  limit?: number;
}

/**
 * Result envelope for memory store query operations.
 */
export interface MemoryQueryResult {
  /** Matching memory records. */
  records: MemoryRecord[];
  /** Total matches before limit applied, when known. */
  totalCount?: number;
}

/**
 * Contract for organizational memory persistence (read path).
 *
 * **No implementation in BUILD-027.** Future builds connect tenant-scoped
 * storage backends without changing the Memory Context Layer interface.
 *
 * @see docs/build-027-report.md
 */
export interface MemoryStore {
  /**
   * Query memory records matching the given filters.
   */
  query(query: MemoryQuery): Promise<MemoryQueryResult>;

  /**
   * Retrieve a single memory record by identifier.
   */
  get(id: string): Promise<MemoryRecord | null>;
}

/**
 * Contract for organizational memory persistence (write path).
 *
 * Separate from read interface so read-only pipeline stages cannot mutate memory.
 * Agents require explicit policy to write per Intelligence Specification §9.4 M7.
 */
export interface MemoryStoreWriter {
  /**
   * Persist a new memory record.
   */
  create(record: Omit<MemoryRecord, "id" | "createdAt">): Promise<MemoryRecord>;

  /**
   * Update an existing memory record.
   */
  update(
    id: string,
    patch: Partial<Omit<MemoryRecord, "id" | "createdAt">>,
  ): Promise<MemoryRecord | null>;

  /**
   * Delete a memory record.
   */
  delete(id: string): Promise<boolean>;
}

/**
 * Combined memory store with read and write capabilities.
 *
 * Interface only — implement in future persistence builds.
 */
export interface MemoryStoreProvider extends MemoryStore, MemoryStoreWriter {}
