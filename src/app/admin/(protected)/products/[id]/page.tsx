import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, RefreshCw } from "lucide-react";
import { ProductStatusBadge } from "@/components/product-status-badge";
import { messages } from "@/lib/messages";
import { formatRelativeTime } from "@/lib/relative-time";
import { getSuggestionAvailability } from "@/server/llm";
import { getAdminProduct } from "@/server/products/service";
import { ProductEditor } from "./editor";
import { MoreActionsButton, ProductGallery } from "./editor-controls";

export default async function AdminProductPage({
  params,
}: PageProps<"/admin/products/[id]">): Promise<ReactElement> {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  const suggestionAvailability = getSuggestionAvailability();

  return (
    <div className="flex flex-col gap-space-lg">
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs text-label-sm text-on-surface-variant">
          <Link
            href="/admin/products"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span>{messages.editor.backToList}</span>
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface">{messages.editor.breadcrumbCurrent}</span>
        </div>
        <div className="flex flex-col justify-between gap-space-md pt-space-xs md:flex-row md:items-center">
          <div className="flex flex-wrap items-start gap-space-md md:items-center">
            <h1 className="text-headline-lg tracking-tight text-on-surface">{product.name}</h1>
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center rounded-full bg-surface-container-high px-2 py-0.5 font-mono text-code-sm font-medium text-on-surface-variant">
                {product.slug}
              </span>
              <ProductStatusBadge status={product.status} tone="soft" />
            </div>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Eye className="size-[18px]" aria-hidden />
              <span>{messages.editor.viewOnSite}</span>
            </Link>
            <MoreActionsButton />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md shadow-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-space-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
            <RefreshCw className="size-5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-label-sm font-semibold text-on-surface">
              {messages.editor.erpHeading}
            </span>
            <span className="truncate font-mono text-code-sm text-on-surface-variant">
              {messages.editor.erpUpdated} {formatRelativeTime(product.updatedAt).toLowerCase()}
            </span>
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-container px-space-xs py-0.5 font-mono text-code-sm text-on-surface-variant">
          <span className="size-1.5 rounded-full bg-tertiary" />
          {messages.editor.erpActive}
        </span>
      </section>

      <ProductGallery />

      <ProductEditor product={product} suggestionAvailability={suggestionAvailability} />
    </div>
  );
}
