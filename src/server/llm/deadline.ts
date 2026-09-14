import "server-only";

export const SUGGESTION_DEADLINE_MS = 20_000;
export const MAX_MODEL_CALLS = 3;

export function withDeadline(
  caller: AbortSignal,
  ms: number = SUGGESTION_DEADLINE_MS,
): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  const stop = (): void => controller.abort();

  caller.addEventListener("abort", stop, { once: true });

  if (caller.aborted) {
    controller.abort();
  }

  return {
    signal: controller.signal,
    done(): void {
      clearTimeout(timeout);
      caller.removeEventListener("abort", stop);
    },
  };
}
