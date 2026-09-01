// High-performance In-Memory TTL Cache for Express Routes
class MemoryCache {
  constructor(defaultTtlMs = 3000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    // Keep cache size bounded to prevent memory growth
    if (this.cache.size > 2000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new MemoryCache(3000); // 3-second TTL for real-time simulation parity
