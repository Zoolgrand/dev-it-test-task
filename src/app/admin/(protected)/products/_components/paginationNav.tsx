import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminListMessages } from "@/content/messages/adminList";

const linkClassName =
  "inline-flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2.5 py-1 text-label-md text-on-surface shadow-sm transition-colors hover:border-primary/40 hover:text-primary";

export function PaginationNav({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}): ReactElement | null {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-space-xs" aria-label={adminListMessages.pagination}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClassName}>
          <ChevronLeft className="size-4" aria-hidden />
          {adminListMessages.previousPage}
        </Link>
      ) : null}
      <span className="px-space-xs font-mono text-code-sm text-on-surface-variant">
        {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={linkClassName}>
          {adminListMessages.nextPage}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
