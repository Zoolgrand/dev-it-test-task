"use client";

import { toast } from "sonner";
import { catalogMessages } from "@/content/messages/catalog";

export function useCopyLink(label: string): { copy: () => Promise<void> } {
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(`${catalogMessages.linkCopied}: ${label}`);
    } catch {
      toast.error(catalogMessages.linkCopyFailed);
    }
  }

  return { copy };
}
