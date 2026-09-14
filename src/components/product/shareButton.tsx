"use client";

import type { ReactElement } from "react";
import { Share2 } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";
import { useCopyLink } from "@/hooks/useCopyLink";

export function ShareButton({ productName }: { productName: string }): ReactElement {
  const { copy } = useCopyLink(productName);

  return (
    <button
      type="button"
      aria-label={catalogMessages.share}
      onClick={copy}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}
