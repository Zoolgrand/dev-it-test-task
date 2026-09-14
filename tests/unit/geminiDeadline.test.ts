import { describe, expect, it } from "vitest";
import { MAX_MODEL_CALLS, SUGGESTION_DEADLINE_MS, withDeadline } from "@/server/llm/deadline";

describe("bounding a model call", () => {
  it("aborts once the deadline passes, even while the caller is still connected", async () => {
    const caller = new AbortController();
    const { signal, done } = withDeadline(caller.signal, 20);

    await new Promise((resolve) => setTimeout(resolve, 60));
    done();

    expect(signal.aborted).toBe(true);
  });

  it("aborts as soon as the caller disconnects, without waiting for the deadline", () => {
    const caller = new AbortController();
    const { signal, done } = withDeadline(caller.signal, 60_000);

    caller.abort();
    done();

    expect(signal.aborted).toBe(true);
  });

  it("stays open while neither the caller nor the clock has given up", () => {
    const caller = new AbortController();
    const { signal, done } = withDeadline(caller.signal, 60_000);

    expect(signal.aborted).toBe(false);
    done();
  });

  it("caps how many model calls one request may cost", () => {
    expect(MAX_MODEL_CALLS).toBeLessThanOrEqual(3);
    expect(SUGGESTION_DEADLINE_MS).toBeGreaterThan(0);
  });
});
