import type { ReactElement } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { editorMessages } from "@/content/messages/editor";
import { cn } from "@/lib/utils";

export function EditorActionBar({
  dirty,
  isSaving,
  showSaved,
  onReset,
}: {
  dirty: boolean;
  isSaving: boolean;
  showSaved: boolean;
  onReset: () => void;
}): ReactElement {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 bg-surface-bright/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl pb-safe lg:static lg:z-auto lg:bg-transparent lg:shadow-none">
      <div className="flex flex-col gap-2 px-margin-mobile py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-space-md lg:rounded-xl lg:bg-surface-container-lowest lg:p-space-md lg:shadow-sm">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2 text-body-sm">
            <span
              className={cn("size-2 rounded-full", dirty ? "bg-warning" : "bg-tertiary")}
              aria-hidden
            />
            <span className={dirty ? "font-medium text-primary" : "text-on-surface-variant"}>
              {dirty ? editorMessages.dirty : editorMessages.clean}
            </span>
          </div>
          <span className="font-mono text-[11px] text-outline lg:hidden">
            {editorMessages.autosave}
          </span>
        </div>
        <div className="flex items-center gap-space-sm">
          <Button
            type="button"
            variant="ghost"
            disabled={!dirty || isSaving}
            onClick={onReset}
            className="min-h-[44px] flex-1 bg-surface-container text-on-surface hover:bg-surface-container-high lg:min-h-0 lg:flex-none lg:bg-transparent"
          >
            {editorMessages.reset}
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!dirty || isSaving}
            className="min-h-[44px] flex-1 disabled:bg-surface-container-highest disabled:text-outline disabled:shadow-none lg:min-h-0 lg:flex-none"
          >
            {showSaved ? (
              <Check className="size-[18px]" aria-hidden />
            ) : (
              <Save className="size-[18px]" aria-hidden />
            )}
            {showSaved ? editorMessages.saved : editorMessages.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
