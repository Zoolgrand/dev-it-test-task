import type { ReactElement } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestionMessages } from "@/content/messages/suggestion";

export function SuggestionSkeleton({ onCancel }: { onCancel: () => void }): ReactElement {
  return (
    <>
      <div className="flex w-full flex-col gap-2.5 rounded-lg border border-primary/20 bg-primary/10 p-3">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2.5">
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
            <span className="text-label-md font-medium text-primary">
              {suggestionMessages.loading}
            </span>
          </div>
          <Button type="button" variant="destructive" size="xs" onClick={onCancel}>
            <X className="size-4" aria-hidden />
            {suggestionMessages.cancel}
          </Button>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-1.5 w-3/4 animate-pulse rounded-full bg-primary" />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-label-sm font-semibold text-outline">
            <RefreshCw className="size-4 animate-spin" aria-hidden />
            {suggestionMessages.analysing}
          </span>
          <span className="text-label-sm font-medium text-outline">
            {suggestionMessages.waiting}
          </span>
        </div>
        <div className="flex flex-col gap-2 py-1">
          <div className="h-3.5 w-full animate-pulse rounded bg-surface-container-highest" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-surface-container-highest" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-container-highest" />
        </div>
      </div>
    </>
  );
}
