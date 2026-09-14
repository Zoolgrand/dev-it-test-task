import "server-only";
import { prisma } from "@/server/db";

export type ThrottleScope = "email" | "ip" | "suggestion";

export type AttemptThrottle = {
  isAllowed(key: string): Promise<boolean>;
  recordAttempt(key: string): Promise<void>;
  reset(key: string): Promise<void>;
  sweepExpired(): Promise<number>;
};

export type AttemptThrottleOptions = {
  scope: ThrottleScope;
  limit: number;
  windowMs: number;
  clock?: () => number;
};

export function createAttemptThrottle(options: AttemptThrottleOptions): AttemptThrottle {
  const clock = options.clock ?? Date.now;
  const keyOf = (key: string): string => `${options.scope}:${key}`;

  return {
    async isAllowed(key: string): Promise<boolean> {
      const entry = await prisma.attemptCounter.findUnique({ where: { key: keyOf(key) } });

      if (!entry || clock() >= entry.resetAt.getTime()) {
        return true;
      }

      return entry.count < options.limit;
    },

    async recordAttempt(key: string): Promise<void> {
      const now = clock();
      const resetAt = new Date(now + options.windowMs);
      const stored = keyOf(key);

      await prisma.$transaction(async (tx) => {
        const entry = await tx.attemptCounter.findUnique({ where: { key: stored } });

        if (!entry || now >= entry.resetAt.getTime()) {
          await tx.attemptCounter.upsert({
            where: { key: stored },
            create: { key: stored, count: 1, resetAt },
            update: { count: 1, resetAt },
          });
          return;
        }

        await tx.attemptCounter.update({
          where: { key: stored },
          data: { count: { increment: 1 } },
        });
      });
    },

    async reset(key: string): Promise<void> {
      await prisma.attemptCounter.deleteMany({ where: { key: keyOf(key) } });
    },

    async sweepExpired(): Promise<number> {
      const result = await prisma.attemptCounter.deleteMany({
        where: { resetAt: { lte: new Date(clock()) } },
      });

      return result.count;
    },
  };
}
