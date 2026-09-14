import type { ReactElement } from "react";
import { feedbackMessages } from "@/content/messages/feedback";

export function PageLoading(): ReactElement {
  return (
    <div role="status" aria-live="polite" className="flex w-full flex-col gap-space-md py-space-xl">
      <span className="sr-only">{feedbackMessages.loading}</span>
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-high" />
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
        <div className="h-48 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-48 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-48 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
    </div>
  );
}
