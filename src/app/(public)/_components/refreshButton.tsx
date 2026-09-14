"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";

export function RefreshButton(): ReactElement {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
    >
      <RefreshCw className="size-[18px]" aria-hidden />
      {catalogMessages.emptyRefresh}
    </button>
  );
}
