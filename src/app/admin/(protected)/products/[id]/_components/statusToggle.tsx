"use client";

import type { ReactElement } from "react";
import { PRODUCT_STATUSES } from "@/domain/product/status";
import type { ProductStatus } from "@/domain/product/status";
import { editorMessages } from "@/content/messages/editor";
import { statusMessages } from "@/content/messages/status";
import { cn } from "@/lib/utils";

const dotClassName: Record<ProductStatus, string> = {
  published: "bg-tertiary",
  draft: "bg-warning",
};

export function StatusToggle({
  value,
  onChange,
}: {
  value: ProductStatus;
  onChange: (status: ProductStatus) => void;
}): ReactElement {
  return (
    <div
      role="radiogroup"
      aria-label={editorMessages.status}
      className="inline-flex self-start rounded-xl bg-surface-container-high p-1 sm:self-auto"
    >
      {PRODUCT_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          role="radio"
          aria-checked={value === status}
          onClick={() => onChange(status)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-label-md transition-all",
            value === status
              ? "bg-surface-container-lowest text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {value === status ? (
            <span className={cn("size-2 rounded-full", dotClassName[status])} />
          ) : null}
          {statusMessages[status]}
        </button>
      ))}
    </div>
  );
}
