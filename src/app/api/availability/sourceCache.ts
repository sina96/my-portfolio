interface CacheEntry<T> {
  promise: Promise<T>;
  expiresAt: number;
}

/** Cache source loads and coalesce concurrent requests, including brief retry backoff. */
export function createSourceCache<T>(ttlMs: number, failureTtlMs: number) {
  const entries = new Map<string, CacheEntry<T>>();

  return function load(key: string, fetchSource: () => Promise<T>): Promise<T> {
    const now = Date.now();
    for (const [cachedKey, cached] of entries) {
      if (cached.expiresAt <= now) entries.delete(cachedKey);
    }
    const cached = entries.get(key);
    if (cached) return cached.promise;

    const entry: CacheEntry<T> = {
      expiresAt: Infinity,
      promise: Promise.resolve().then(fetchSource).then(
        (value) => { entry.expiresAt = Date.now() + ttlMs; return value; },
        (error: unknown) => { entry.expiresAt = Date.now() + failureTtlMs; throw error; },
      ),
    };
    entries.set(key, entry);
    return entry.promise;
  };
}
