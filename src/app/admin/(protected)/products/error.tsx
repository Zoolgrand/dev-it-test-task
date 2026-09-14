"use client";

import type { ReactElement } from "react";
import { PageError } from "@/components/pageError";

export default function Error({
  reset,
}: {
  error: globalThis.Error;
  reset: () => void;
}): ReactElement {
  return <PageError onRetry={reset} />;
}
