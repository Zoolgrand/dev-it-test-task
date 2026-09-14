import type { ReactElement } from "react";
import { Lock } from "lucide-react";
import { editorMessages } from "@/content/messages/editor";

export function ReadOnlyNameField({ name }: { name: string }): ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-space-sm">
        <span className="text-label-md text-on-surface">{editorMessages.name}</span>
        <span className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          <Lock className="size-3" aria-hidden />
          {editorMessages.readOnly}
        </span>
      </div>
      <input
        type="text"
        value={name}
        readOnly
        disabled
        tabIndex={-1}
        aria-hidden
        className="w-full cursor-not-allowed rounded-lg bg-surface-container-low px-3 py-2 text-body-md text-on-surface-variant outline-none select-all"
      />
      <p className="text-body-sm text-outline">{editorMessages.nameHint}</p>
    </div>
  );
}
