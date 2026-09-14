"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { messages } from "@/lib/messages";

export function SearchField({ className }: { className?: string }): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const current = searchParams.get("q") ?? "";

    if (current === query) {
      return;
    }

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);

      if (query === "") {
        next.delete("q");
      } else {
        next.set("q", query);
      }

      router.replace(next.size === 0 ? pathname : `${pathname}?${next.toString()}`);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, query, router, searchParams]);

  return (
    <div className={className}>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-space-sm size-[18px] text-on-surface-variant"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={messages.adminList.search}
          placeholder={messages.adminList.search}
          className="h-9 border border-outline-variant/60 bg-surface-container-lowest py-0 pr-space-md pl-8 text-body-sm shadow-sm focus:border-primary focus:bg-surface-container-lowest"
        />
      </div>
    </div>
  );
}
