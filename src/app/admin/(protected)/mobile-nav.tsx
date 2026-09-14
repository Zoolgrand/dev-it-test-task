"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, Package, Search } from "lucide-react";
import { messages } from "@/lib/messages";

const sections = [
  { label: messages.nav.mobileContent, Icon: FileText },
  { label: messages.nav.mobileSeo, Icon: Search },
  { label: messages.nav.mobileLog, Icon: History },
];

export function AdminMobileNav(): ReactElement | null {
  const pathname = usePathname();

  if (/^\/admin\/products\/[^/]+$/.test(pathname)) {
    return null;
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 flex items-stretch justify-around border-t border-outline-variant/40 bg-surface-container-lowest pb-safe lg:hidden">
      <Link
        href="/admin/products"
        aria-current="page"
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-label-sm text-primary"
      >
        <Package className="size-5" aria-hidden />
        {messages.nav.mobileCatalog}
      </Link>
      {sections.map(({ label, Icon }) => (
        <span
          key={label}
          aria-disabled
          className="flex flex-1 cursor-default flex-col items-center gap-1 py-2.5 text-label-sm text-on-surface-variant/70"
        >
          <Icon className="size-5" aria-hidden />
          {label}
        </span>
      ))}
    </nav>
  );
}
