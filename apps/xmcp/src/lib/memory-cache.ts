export interface CacheOptions {
  maxEntries?: number;
  ttlMs?: number;
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

/**
 * Lightweight, zero-dependency in-memory cache with TTL and capacity bounds.
 */
export class MemoryCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  constructor(options: CacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? 500;
    this.defaultTtlMs = options.ttlMs ?? 300_000; // 5 minutes default
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh Map order for LRU behavior
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first item in Map iteration)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
