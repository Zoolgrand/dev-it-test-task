import type { ReactElement } from "react";
import { BadgeCheck, Check, Image as ImageIcon, Package } from "lucide-react";
import type { PublicProduct } from "@/domain/product/dto";
import { FavouriteToggle } from "@/components/product/favouriteToggle";
import { catalogMessages } from "@/content/messages/catalog";
import { demoHighlight } from "@/content/demoCatalog";
import { cn } from "@/lib/utils";

const thumbnails = ["main", "second", "third", "fourth"];

export function ProductGallery({ product }: { product: PublicProduct }): ReactElement {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low text-outline">
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold text-primary shadow-sm backdrop-blur-md">
            {demoHighlight(product.slug)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold text-tertiary shadow-sm backdrop-blur-md">
            <BadgeCheck className="size-3.5" aria-hidden />
            {catalogMessages.guarantee}
          </span>
        </div>
        <Package className="size-20" aria-hidden />
        <FavouriteToggle productName={product.name} />
      </div>

      <div className="flex items-center justify-between gap-space-sm text-body-sm">
        <span className="flex items-center gap-1.5 text-tertiary">
          <span className="size-2 rounded-full bg-tertiary" />
          {catalogMessages.inStock}
        </span>
        <span className="text-on-surface-variant">{catalogMessages.shipping}</span>
      </div>

      <ul className="grid grid-cols-4 gap-space-sm">
        {thumbnails.map((thumbnail, index) => (
          <li
            key={thumbnail}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl bg-surface-container-low text-outline",
              index === 0 && "ring-2 ring-primary",
            )}
          >
            <ImageIcon className="size-6" aria-hidden />
          </li>
        ))}
      </ul>

      {product.attributes.length > 0 ? (
        <ul className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
          {product.attributes.slice(0, 3).map((attribute) => (
            <li
              key={attribute.id}
              className="flex min-w-0 flex-col gap-1 rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
            >
              <Check className="size-4 text-primary" aria-hidden />
              <span className="text-headline-sm break-words hyphens-auto text-on-surface">
                {attribute.value}
              </span>
              <span className="text-label-sm break-words text-on-surface-variant">
                {attribute.name}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
