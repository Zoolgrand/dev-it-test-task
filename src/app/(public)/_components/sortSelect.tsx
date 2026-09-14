"use client";

import type { ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CATALOG_SORTS } from "@/domain/product/catalogSort";
import type { CatalogSort } from "@/domain/product/catalogSort";
import { catalogMessages } from "@/content/messages/catalog";
import { catalogSortLabels } from "@/content/messages/catalogSort";
import { buildHref } from "@/lib/href";

export function SortSelect({ value }: { value: CatalogSort }): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(next: string): void {
    router.replace(buildHref("/", searchParams, { sort: next === "popular" ? null : next }));
  }

  return (
    <div className="flex items-center gap-2">
      <label
        className="hidden text-body-sm text-on-surface-variant sm:inline"
        htmlFor="catalog-sort"
      >
        {catalogMessages.sortLabel}
      </label>
      <div className="relative">
        <select
          id="catalog-sort"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className="cursor-pointer appearance-none rounded-xl bg-surface-container-lowest py-1.5 pr-9 pl-3.5 text-label-md text-on-surface shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/20"
        >
          {CATALOG_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {catalogSortLabels[sort]}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-[18px] -translate-y-1/2 text-outline"
          aria-hidden
        />
      </div>
    </div>
  );
}
