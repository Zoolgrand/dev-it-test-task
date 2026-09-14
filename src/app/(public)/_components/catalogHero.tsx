import type { ReactElement } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";

export function CatalogHero(): ReactElement {
  return (
    <>
      <nav
        aria-label={catalogMessages.heading}
        className="mb-space-sm flex items-center gap-space-xs text-label-sm text-on-surface-variant"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          {catalogMessages.breadcrumbHome}
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="font-medium text-on-surface">{catalogMessages.heading}</span>
      </nav>

      <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div className="max-w-3xl space-y-space-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {catalogMessages.badge}
          </span>
          <h1 className="text-display font-semibold tracking-tight text-on-surface">
            {catalogMessages.heading}
          </h1>
          <p className="text-body-lg leading-relaxed text-on-surface-variant">
            {catalogMessages.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm self-start md:self-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1.5 text-label-sm text-tertiary">
            <BadgeCheck className="size-4" aria-hidden />
            {catalogMessages.guarantee}
          </div>
        </div>
      </div>
    </>
  );
}
