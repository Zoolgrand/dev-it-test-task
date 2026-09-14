"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { messages } from "@/lib/messages";

export function CatalogSearch({ className }: { className?: string }): ReactElement {
  const router = useRouter();
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

      router.replace(next.size === 0 ? "/" : `/?${next.toString()}`);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className={`relative flex items-center ${className ?? ""}`}>
      <Search
        className="pointer-events-none absolute left-2.5 size-[18px] text-outline"
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={messages.catalog.search}
        placeholder={messages.catalog.search}
        className="h-9 w-full rounded-xl bg-surface-container-low pr-space-sm pl-9 text-body-sm text-on-surface transition-all outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
