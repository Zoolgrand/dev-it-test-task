"use client";

import type { ReactElement } from "react";
import { Bold, ImagePlus, Italic, Link2, List, MoreVertical, Package } from "lucide-react";
import { toast } from "sonner";
import { messages } from "@/lib/messages";

const tools = [
  { label: messages.editor.formatBold, Icon: Bold },
  { label: messages.editor.formatItalic, Icon: Italic },
  { label: messages.editor.formatList, Icon: List },
];

export function DescriptionToolbar(): ReactElement {
  function notify(): void {
    toast.info(messages.editor.formattingUnavailable);
  }

  return (
    <div className="flex items-center gap-1 rounded-t-lg bg-surface-container-low px-2 py-1.5">
      {tools.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          title={label}
          aria-label={label}
          onClick={notify}
          className="flex size-7 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
      <div className="mx-1 h-3 w-px bg-outline-variant/50" />
      <button
        type="button"
        title={messages.editor.formatLink}
        aria-label={messages.editor.formatLink}
        onClick={notify}
        className="flex size-7 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
      >
        <Link2 className="size-4" aria-hidden />
      </button>
      <span className="ml-auto text-label-sm text-outline">{messages.editor.markdownNote}</span>
    </div>
  );
}

export function ProductGallery(): ReactElement {
  return (
    <div className="grid grid-cols-3 gap-space-sm lg:hidden">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface-container text-outline shadow-sm">
        <Package className="size-8" aria-hidden />
        <span className="absolute bottom-1 left-1 rounded bg-inverse-surface/80 px-1.5 py-0.5 font-mono text-[10px] text-inverse-on-surface backdrop-blur-sm">
          {messages.editor.galleryMain}
        </span>
      </div>
      <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-container text-outline shadow-sm">
        <Package className="size-8" aria-hidden />
      </div>
      <button
        type="button"
        onClick={() => toast.info(messages.editor.galleryUnavailable)}
        className="flex aspect-square flex-col items-center justify-center rounded-xl bg-surface-container text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high"
      >
        <ImagePlus className="size-6" aria-hidden />
        <span className="mt-1 text-center text-[11px] text-label-sm">
          {messages.editor.galleryMore}
        </span>
      </button>
    </div>
  );
}

export function MoreActionsButton(): ReactElement {
  return (
    <button
      type="button"
      aria-label={messages.editor.moreActions}
      onClick={() => toast.info(messages.editor.moreActionsUnavailable)}
      className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <MoreVertical className="size-[18px]" aria-hidden />
    </button>
  );
}
