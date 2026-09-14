import type { ReactElement } from "react";
import { Check, Star } from "lucide-react";
import type { PublicProduct } from "@/domain/product/dto";
import { DemoAction } from "@/components/demoAction";
import { ShareButton } from "@/components/product/shareButton";
import { catalogMessages } from "@/content/messages/catalog";
import { productMessages } from "@/content/messages/product";
import {
  demoArticle,
  demoPrice,
  demoPriceBeforeDiscount,
  demoRating,
  demoReviewCount,
} from "@/content/demoCatalog";
import { formatPrice } from "@/lib/formatting/price";
import { cn } from "@/lib/utils";
import { TrustList } from "./trustList";

export function PurchasePanel({ product }: { product: PublicProduct }): ReactElement {
  const rating = demoRating(product.slug);

  return (
    <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-primary-fixed/40 px-2 py-0.5 font-mono text-code-sm text-primary">
          {product.attributes[0]?.name ?? productMessages.attributes}
        </span>
        <span className="font-mono text-code-sm text-on-surface-variant">
          {catalogMessages.article} {demoArticle(product.slug)}
        </span>
        <span className="ml-auto font-mono text-code-sm text-outline">{product.slug}</span>
      </div>

      <h1 className="text-display font-semibold tracking-tight text-on-surface">{product.name}</h1>

      <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
        <span className="flex items-center gap-0.5 text-warning">
          {[1, 2, 3, 4, 5].map((position) => (
            <Star
              key={position}
              className={cn(
                "size-4",
                position <= Math.round(rating)
                  ? "fill-warning text-warning"
                  : "text-outline-variant",
              )}
              aria-hidden
            />
          ))}
        </span>
        <span className="font-medium text-on-surface">{rating.toFixed(1)}</span>
        <span className="size-1 rounded-full bg-outline-variant" />
        <span>
          {demoReviewCount(product.slug)} {catalogMessages.reviews}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-space-sm">
        <span className="text-display font-bold text-primary">
          {formatPrice(demoPrice(product.slug))}
        </span>
        <span className="text-body-lg text-outline line-through">
          {formatPrice(demoPriceBeforeDiscount(product.slug))}
        </span>
        <span className="rounded-full bg-error-container px-2 py-0.5 text-label-sm font-medium text-on-error-container">
          {catalogMessages.discount}
        </span>
      </div>

      {product.attributes.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-space-md">
          <span className="text-label-md font-semibold text-on-surface">
            {catalogMessages.highlightsHeading}
          </span>
          <ul className="flex flex-col gap-1.5">
            {product.attributes.slice(0, 4).map((attribute) => (
              <li key={attribute.id} className="flex items-start gap-2 text-body-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span className="text-on-surface-variant">
                  {attribute.name}: <span className="text-on-surface">{attribute.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center gap-space-sm">
        <DemoAction
          message={catalogMessages.cartUnavailable}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-label-md font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-container"
        >
          {catalogMessages.addToCart}
        </DemoAction>
        <ShareButton productName={product.name} />
      </div>
      <DemoAction
        message={catalogMessages.cartUnavailable}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-low px-5 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
      >
        {catalogMessages.quickOrder}
      </DemoAction>

      <TrustList />
    </div>
  );
}
