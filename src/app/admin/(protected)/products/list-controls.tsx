"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { MoreVertical, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { messages } from "@/lib/messages";

export function FiltersButton(): ReactElement {
  return (
    <button
      type="button"
      onClick={() => toast.info(messages.adminList.filtersUnavailable)}
      className="flex h-9 items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-space-sm text-label-md text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-low hover:text-on-surface"
    >
      <SlidersHorizontal className="size-[18px]" aria-hidden />
      <span className="hidden sm:inline">{messages.adminList.filters}</span>
    </button>
  );
}

export function RowMenuButton({ productName }: { productName: string }): ReactElement {
  return (
    <button
      type="button"
      aria-label={`${messages.adminList.rowMenu}: ${productName}`}
      onClick={() => toast.info(messages.adminList.rowMenuUnavailable)}
      className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <MoreVertical className="size-5" aria-hidden />
    </button>
  );
}

export function SelectRowCheckbox({
  label,
  className,
}: {
  label: string;
  className?: string;
}): ReactElement {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={isChecked}
      onChange={(event) => setIsChecked(event.target.checked)}
      className={`size-4 cursor-pointer rounded border-outline-variant text-primary accent-primary ${className ?? ""}`}
    />
  );
}
