import type { ReactElement } from "react";
import Link from "next/link";
import { Clock, Package, Pencil } from "lucide-react";
import type { AdminProductListItem } from "@/domain/product/dto";
import { ProductStatusBadge } from "@/components/productStatusBadge";
import { RelativeTime } from "@/components/relativeTime";
import { adminListMessages } from "@/content/messages/adminList";
import { RowMenuButton } from "./listActions";

export function ProductCardList({ products }: { products: AdminProductListItem[] }): ReactElement {
  return (
    <ul className="flex w-full flex-col gap-3 md:hidden">
      {products.map((product) => (
        <li key={product.id}>
          <article className="relative flex flex-col rounded-xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="mb-2.5 flex items-start justify-between gap-space-sm">
              <div className="flex min-w-0 items-center gap-2">
                <ProductStatusBadge status={product.status} tone="soft" className="shrink-0" />
                <span className="truncate font-mono text-code-sm text-on-surface-variant">
                  {product.slug}
                </span>
              </div>
              <RowMenuButton productName={product.name} />
            </div>
            <div className="mb-3 flex gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                <Package className="size-6" aria-hidden />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h2 className="line-clamp-2 text-headline-sm leading-tight text-on-surface">
                  {product.name}
                </h2>
                {product.category ? (
                  <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">
                    {product.category}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                <Clock className="size-4" aria-hidden />
                <RelativeTime iso={product.updatedAt} />
              </div>
              <Link
                href={`/admin/products/${product.id}`}
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-container px-4 text-label-md text-on-surface transition-all hover:bg-secondary-container"
              >
                <Pencil className="size-[18px]" aria-hidden />
                <span>{adminListMessages.edit}</span>
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
