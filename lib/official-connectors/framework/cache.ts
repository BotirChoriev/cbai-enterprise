/** Simple TTL cache for official connector responses — never invents values. */

type CacheEntry = {
  readonly expiresAt: number;
  readonly payload: string;
};

const cache = new Map<string, CacheEntry>();

export function cacheGet(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.payload;
}

export function cacheSet(key: string, payload: string, ttlMs: number): void {
  cache.set(key, { expiresAt: Date.now() + ttlMs, payload });
}

export function cacheClear(): void {
  cache.clear();
}

export function cacheSize(): number {
  return cache.size;
}
