import type { ReactElement } from "react";
import Link from "next/link";
import { Home, PackageOpen } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";
import { RefreshButton } from "./refreshButton";

export function CatalogEmptyState(): ReactElement {
  return (
    <section className="flex flex-col items-center gap-space-md rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
        <PackageOpen className="size-8" aria-hidden />
      </span>
      <h2 className="text-headline-md font-semibold text-on-surface">{catalogMessages.empty}</h2>
      <p className="max-w-md text-body-md text-on-surface-variant">{catalogMessages.emptyNote}</p>
      <div className="flex w-full max-w-sm flex-col gap-space-sm">
        <RefreshButton />
        <Link
          href="/"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/60 px-4 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <Home className="size-[18px]" aria-hidden />
          {catalogMessages.emptyHome}
        </Link>
      </div>
    </section>
  );
}
