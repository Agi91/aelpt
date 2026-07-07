export interface CacheEntry {
  value: string;
  expiresAt: number;
}

export class AiCache {
  private cache = new Map<string, CacheEntry>();

  /**
   * Look up prompt cache keys. Returns value if present and not expired.
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Write value to cache. Default TTL is 10 minutes (600,000 ms).
   */
  set(key: string, value: string, ttlMs: number = 10 * 60 * 1000): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Clear all entries from the local memory cache cache maps.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retrieve active cache entry size metrics.
   */
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const aiCache = new AiCache();
