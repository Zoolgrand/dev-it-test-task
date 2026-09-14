"use client";

import type { ReactElement } from "react";
import { Search } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";
import { useDebouncedSearchParam } from "@/hooks/useDebouncedSearchParam";
import { cn } from "@/lib/utils";

export function CatalogSearch({ className }: { className?: string }): ReactElement {
  const { value, setValue } = useDebouncedSearchParam("q");

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 size-[18px] text-outline"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={catalogMessages.search}
        placeholder={catalogMessages.search}
        className="h-9 w-full rounded-xl bg-surface-container-low pr-space-sm pl-9 text-body-sm text-on-surface transition-all outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
