"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Heart, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { messages } from "@/lib/messages";
import { CATALOG_SORTS, catalogSortLabels } from "./catalog-sort";
import type { CatalogSort } from "./catalog-sort";

export function SortSelect({ value }: { value: CatalogSort }): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(next: string): void {
    const params = new URLSearchParams(searchParams);

    if (next === "popular") {
      params.delete("sort");
    } else {
      params.set("sort", next);
    }

    router.replace(params.size === 0 ? "/" : `/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label
        className="hidden text-body-sm text-on-surface-variant sm:inline"
        htmlFor="catalog-sort"
      >
        {messages.catalog.sortLabel}
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

export function FavouriteToggle({ productName }: { productName: string }): ReactElement {
  const [isFavourite, setIsFavourite] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={isFavourite}
      aria-label={`${isFavourite ? messages.catalog.favouriteRemove : messages.catalog.favouriteAdd}: ${productName}`}
      onClick={() => setIsFavourite((previous) => !previous)}
      className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface-variant shadow-sm backdrop-blur-md transition-colors hover:text-error"
    >
      <Heart
        className={isFavourite ? "size-[18px] fill-error text-error" : "size-[18px]"}
        aria-hidden
      />
    </button>
  );
}

export function RefreshButton(): ReactElement {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
    >
      <RefreshCw className="size-[18px]" aria-hidden />
      {messages.catalog.emptyRefresh}
    </button>
  );
}

export function ExpertButton(): ReactElement {
  return (
    <button
      type="button"
      onClick={() => toast.info(messages.catalog.expertUnavailable)}
      className="rounded-xl bg-on-surface px-5 py-2.5 text-label-md text-surface shadow-sm transition-colors hover:bg-on-surface/90"
    >
      {messages.catalog.expertAction}
    </button>
  );
}

export function ShareButton({ productName }: { productName: string }): ReactElement {
  async function handleClick(): Promise<void> {
    await navigator.clipboard.writeText(window.location.href);
    toast.success(`${messages.catalog.linkCopied}: ${productName}`);
  }

  return (
    <button
      type="button"
      aria-label={messages.catalog.share}
      onClick={handleClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}

export function AddToCartButton(): ReactElement {
  return (
    <button
      type="button"
      onClick={() => toast.info(messages.catalog.cartUnavailable)}
      className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-label-md font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-container"
    >
      {messages.catalog.addToCart}
    </button>
  );
}

export function QuickOrderButton(): ReactElement {
  return (
    <button
      type="button"
      onClick={() => toast.info(messages.catalog.cartUnavailable)}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-low px-5 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
    >
      {messages.catalog.quickOrder}
    </button>
  );
}
