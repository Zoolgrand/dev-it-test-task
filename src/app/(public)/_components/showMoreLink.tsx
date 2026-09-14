import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { adminListMessages } from "@/content/messages/adminList";
import { catalogMessages } from "@/content/messages/catalog";
import { selectPlural } from "@/lib/formatting/plural";

export function ShowMoreLink({
  href,
  remaining,
}: {
  href: string;
  remaining: number;
}): ReactElement {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
    >
      <ChevronRight className="size-[18px]" aria-hidden />
      {catalogMessages.showMore} {remaining}{" "}
      {selectPlural(remaining, adminListMessages.productForms)}
    </Link>
  );
}
