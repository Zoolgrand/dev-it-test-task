import type { ReactElement } from "react";
import Link from "next/link";
import type { ProductStatus } from "@/domain/product/status";
import { adminListMessages } from "@/content/messages/adminList";
import { cn } from "@/lib/utils";

export type ListTab = ProductStatus | "all";

export const listTabs: Array<{ value: ListTab; label: string; shortLabel: string }> = [
  { value: "all", label: adminListMessages.tabAll, shortLabel: adminListMessages.tabAllShort },
  {
    value: "published",
    label: adminListMessages.tabPublished,
    shortLabel: adminListMessages.tabPublished,
  },
  {
    value: "draft",
    label: adminListMessages.tabDrafts,
    shortLabel: adminListMessages.tabDrafts,
  },
];

export function StatusTabs({
  active,
  counts,
  hrefFor,
  variant,
}: {
  active: ListTab;
  counts: Record<ListTab, number>;
  hrefFor: (tab: ListTab) => string;
  variant: "pills" | "underline";
}): ReactElement {
  return (
    <>
      {listTabs.map((tab) => (
        <Link
          key={tab.value}
          href={hrefFor(tab.value)}
          aria-current={tab.value === active ? "page" : undefined}
          className={
            variant === "pills"
              ? cn(
                  "flex min-h-9 items-center rounded-lg px-3 text-label-sm",
                  tab.value === active
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant",
                )
              : cn(
                  "pb-1",
                  tab.value === active
                    ? "-mb-[9px] border-b-2 border-primary text-headline-sm text-on-surface"
                    : "text-on-surface-variant transition-colors hover:text-on-surface",
                )
          }
        >
          {variant === "pills"
            ? `${tab.shortLabel} (${counts[tab.value]})`
            : tab.value === "all"
              ? tab.label
              : `${tab.label} (${counts[tab.value]})`}
        </Link>
      ))}
    </>
  );
}
