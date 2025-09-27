interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum cache size
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100; // Maximum 100 items in cache
  private invalidateCallbacks = new Set<(key: string) => void>();
  private isNotifying = false; // Flag to prevent recursive notifications

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  /**
   * Subscribe to cache invalidation events
   */
  subscribe(callback: (key: string) => void): () => void {
    this.invalidateCallbacks.add(callback);
    return () => {
      this.invalidateCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers about cache invalidation
   */
  private notifyInvalidate(key: string): void {
    if (this.isNotifying) {
      return; // Prevent recursive notifications
    }
    
    this.isNotifying = true;
    try {
      this.invalidateCallbacks.forEach(callback => {
        try {
          callback(key);
        } catch (error) {
          console.error('Error in cache invalidation callback:', error);
        }
      });
    } finally {
      this.isNotifying = false;
    }
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  /**
   * Remove item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.notifyInvalidate(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate cache by pattern with wildcard support
   * Supports patterns like "project:*", "user:*", "*:active", etc.
   */
  invalidate(pattern: string): void {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*') // Replace * with .* for regex
      .replace(/\?/g, '.'); // Replace ? with . for single character match
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    // Find and delete matching keys
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    // Delete matching keys
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.notifyInvalidate(key);
    });
  }
}

// Create singleton instance
export const cache = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
});

// Export types
export type { CacheOptions };

