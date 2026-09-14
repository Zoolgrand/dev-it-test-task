"use client";

import type { ReactElement } from "react";
import { ImagePlus, MoreVertical, Package } from "lucide-react";
import { DemoAction } from "@/components/demoAction";
import { editorMessages } from "@/content/messages/editor";

export function MoreActionsButton(): ReactElement {
  return (
    <DemoAction
      message={editorMessages.moreActionsUnavailable}
      label={editorMessages.moreActions}
      className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <MoreVertical className="size-[18px]" aria-hidden />
    </DemoAction>
  );
}

export function ProductGallery(): ReactElement {
  return (
    <div className="grid grid-cols-3 gap-space-sm lg:hidden">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface-container text-outline shadow-sm">
        <Package className="size-8" aria-hidden />
        <span className="absolute bottom-1 left-1 rounded bg-inverse-surface/80 px-1.5 py-0.5 font-mono text-[10px] text-inverse-on-surface backdrop-blur-sm">
          {editorMessages.galleryMain}
        </span>
      </div>
      <div className="flex aspect-square items-center justify-center rounded-xl bg-surface-container text-outline shadow-sm">
        <Package className="size-8" aria-hidden />
      </div>
      <DemoAction
        message={editorMessages.galleryUnavailable}
        className="flex aspect-square flex-col items-center justify-center rounded-xl bg-surface-container text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-high"
      >
        <ImagePlus className="size-6" aria-hidden />
        <span className="mt-1 text-center text-[11px] text-label-sm">
          {editorMessages.galleryMore}
        </span>
      </DemoAction>
    </div>
  );
}
