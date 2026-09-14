import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";

export function ProductBreadcrumbs({ productName }: { productName: string }): ReactElement {
  return (
    <div className="flex items-center justify-between gap-space-md">
      <nav
        aria-label={catalogMessages.heading}
        className="flex min-w-0 items-center gap-space-xs text-label-sm text-on-surface-variant"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          {catalogMessages.breadcrumbHome}
        </Link>
        <ChevronRight className="size-4 shrink-0 text-outline-variant" aria-hidden />
        <Link href="/" className="transition-colors hover:text-primary">
          {catalogMessages.heading}
        </Link>
        <ChevronRight className="size-4 shrink-0 text-outline-variant" aria-hidden />
        <span className="truncate font-medium text-on-surface">{productName}</span>
      </nav>
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1 text-label-sm text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {catalogMessages.backToCatalog}
      </Link>
    </div>
  );
}
