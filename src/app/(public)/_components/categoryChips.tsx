import type { ReactElement } from "react";
import Link from "next/link";
import { catalogMessages } from "@/content/messages/catalog";
import { cn } from "@/lib/utils";

const chipClassName = "shrink-0 rounded-full px-4 py-2 text-label-md transition-all";

export function CategoryChips({
  categories,
  active,
  hrefFor,
}: {
  categories: string[];
  active: string;
  hrefFor: (category: string) => string;
}): ReactElement {
  const entries: Array<{ value: string; label: string }> = [
    { value: "", label: catalogMessages.categoryAll },
    ...categories.map((name) => ({ value: name, label: name })),
  ];

  return (
    <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs">
      {entries.map((entry) => (
        <Link
          key={entry.value === "" ? "all" : entry.value}
          href={hrefFor(entry.value)}
          aria-current={active === entry.value ? "page" : undefined}
          className={cn(
            chipClassName,
            active === entry.value
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container text-on-surface hover:bg-surface-container-high",
          )}
        >
          {entry.label}
        </Link>
      ))}
    </div>
  );
}
