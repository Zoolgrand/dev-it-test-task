import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import type { PublicProduct } from "@/domain/product/dto";
import { FavouriteToggle } from "@/components/product/favouriteToggle";
import { catalogMessages } from "@/content/messages/catalog";
import { productMessages } from "@/content/messages/product";
import { demoArticle, demoHighlight, demoPrice } from "@/content/demoCatalog";
import { formatPrice } from "@/lib/formatting/price";

export function ProductCard({ product }: { product: PublicProduct }): ReactElement {
  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-container-low text-outline">
        <Package
          className="size-14 transition-transform duration-500 group-hover:scale-105"
          aria-hidden
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold text-primary shadow-sm backdrop-blur-md">
            {demoHighlight(product.slug)}
          </span>
        </div>
        <FavouriteToggle productName={product.name} />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-space-md p-space-md">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary-fixed/40 px-2 py-0.5 font-mono text-code-sm text-primary">
              {product.attributes[0]?.name ?? productMessages.attributes}
            </span>
            <span className="text-body-sm text-outline">
              {catalogMessages.article} {demoArticle(product.slug)}
            </span>
          </div>
          <h2 className="text-headline-md text-on-surface transition-colors group-hover:text-primary">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h2>
          <p className="line-clamp-2 text-body-sm leading-relaxed text-on-surface-variant">
            {product.description}
          </p>
        </div>
        <div className="space-y-space-sm pt-space-xs">
          <div className="flex flex-wrap gap-1.5">
            {product.attributes.slice(0, 3).map((attribute) => (
              <span
                key={attribute.id}
                className="max-w-full rounded-md bg-surface-container px-2 py-0.5 font-mono text-code-sm break-words text-on-surface-variant"
              >
                {attribute.value}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-space-xs">
            <span className="text-headline-lg font-bold text-on-surface">
              {formatPrice(demoPrice(product.slug))}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 text-label-md font-semibold text-primary transition-colors hover:text-primary-container"
            >
              {catalogMessages.view}
              <ArrowRight className="size-[18px]" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
