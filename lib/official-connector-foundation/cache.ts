/**
 * Cache interface + in-memory implementation for Phase 1.
 */

export type CacheEntry<T> = {
  readonly value: T;
  readonly storedAt: string;
  readonly expiresAt: string;
};

export interface ConnectorCache {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, value: T, ttlMs: number): void;
  delete(key: string): void;
  clear(): void;
}

export class InMemoryConnectorCache implements ConnectorCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.parse(entry.expiresAt) <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry as CacheEntry<T>;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const storedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + Math.max(0, ttlMs)).toISOString();
    this.store.set(key, { value, storedAt, expiresAt });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export function buildCacheKey(parts: readonly string[]): string {
  return parts.map((part) => part.trim().toLowerCase()).join("|");
}
