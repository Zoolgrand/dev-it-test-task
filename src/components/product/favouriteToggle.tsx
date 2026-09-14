"use client";

import type { ReactElement } from "react";
import { Heart } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";
import { useToggle } from "@/hooks/useToggle";
import { cn } from "@/lib/utils";

export function FavouriteToggle({ productName }: { productName: string }): ReactElement {
  const { isOn: isFavourite, toggle } = useToggle();

  return (
    <button
      type="button"
      aria-pressed={isFavourite}
      aria-label={`${isFavourite ? catalogMessages.favouriteRemove : catalogMessages.favouriteAdd}: ${productName}`}
      onClick={toggle}
      className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface-variant shadow-sm backdrop-blur-md transition-colors hover:text-error"
    >
      <Heart className={cn("size-[18px]", isFavourite && "fill-error text-error")} aria-hidden />
    </button>
  );
}
