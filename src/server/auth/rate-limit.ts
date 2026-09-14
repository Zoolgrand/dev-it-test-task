import "server-only";

export type RateLimiter = {
  isAllowed(key: string): boolean;
  recordFailure(key: string): void;
  reset(key: string): void;
};

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
  clock?: () => number;
}): RateLimiter {
  const clock = options.clock ?? Date.now;
  const attempts = new Map<string, { count: number; resetAt: number }>();

  function currentEntry(key: string): { count: number; resetAt: number } | undefined {
    const entry = attempts.get(key);

    if (entry && clock() >= entry.resetAt) {
      attempts.delete(key);
      return undefined;
    }

    return entry;
  }

  return {
    isAllowed(key: string): boolean {
      const entry = currentEntry(key);
      return (entry?.count ?? 0) < options.limit;
    },
    recordFailure(key: string): void {
      const entry = currentEntry(key);

      if (entry) {
        entry.count += 1;
        return;
      }

      attempts.set(key, { count: 1, resetAt: clock() + options.windowMs });
    },
    reset(key: string): void {
      attempts.delete(key);
    },
  };
}
