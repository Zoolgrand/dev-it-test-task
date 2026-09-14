import type { ReactElement } from "react";
import { Check, CheckCircle2, Lightbulb, RefreshCw } from "lucide-react";
import type { Suggestion } from "@/domain/product/suggestion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { editorMessages } from "@/content/messages/editor";
import { suggestionMessages } from "@/content/messages/suggestion";

export function SuggestionResult({
  suggestion,
  isDemo,
  onRegenerate,
  onApply,
  onDismiss,
}: {
  suggestion: Suggestion;
  isDemo: boolean;
  onRegenerate: () => void;
  onApply: () => void;
  onDismiss: () => void;
}): ReactElement {
  return (
    <>
      <div className="flex items-center justify-between gap-space-sm rounded-lg border border-tertiary/20 bg-tertiary-fixed/30 p-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-[18px] text-tertiary" aria-hidden />
          <span className="text-label-md font-medium text-tertiary">
            {suggestionMessages.generatedBanner}
          </span>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center gap-1 text-label-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <RefreshCw className="size-4" aria-hidden />
          {suggestionMessages.regenerate}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="flex items-center gap-1.5 text-label-sm font-semibold text-on-surface">
            <Lightbulb className="size-4 text-primary" aria-hidden />
            {suggestionMessages.generated}
          </span>
          {isDemo ? <Badge variant="outline">{suggestionMessages.demoBadge}</Badge> : null}
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm tracking-wider text-outline uppercase">
              {editorMessages.description}
            </span>
            <p className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2.5 text-body-sm leading-relaxed whitespace-pre-wrap text-on-surface">
              {suggestion.description}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-label-sm tracking-wider text-outline uppercase">
              {suggestionMessages.seoGroup}
            </span>
            <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2.5">
              <span className="text-serp-link truncate text-body-sm leading-tight font-medium">
                {suggestion.seoTitle}
              </span>
              <span className="text-body-sm leading-snug text-on-surface-variant">
                {suggestion.seoDescription}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button type="button" onClick={onApply} className="flex-1">
            <Check className="size-[18px]" aria-hidden />
            {suggestionMessages.apply}
          </Button>
          <Button type="button" variant="outline" onClick={onDismiss}>
            {suggestionMessages.dismiss}
          </Button>
        </div>
      </div>
    </>
  );
}
