"use client";

import type { ReactElement } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { adminListMessages } from "@/content/messages/adminList";
import { useDebouncedSearchParam } from "@/hooks/useDebouncedSearchParam";

export function SearchField({ className }: { className?: string }): ReactElement {
  const { value, setValue } = useDebouncedSearchParam("q", { resets: ["page"] });

  return (
    <div className={className}>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-space-sm size-[18px] text-on-surface-variant"
          aria-hidden
        />
        <Input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label={adminListMessages.search}
          placeholder={adminListMessages.search}
          className="h-9 border border-outline-variant/60 bg-surface-container-lowest py-0 pr-space-md pl-8 text-body-sm shadow-sm focus:border-primary focus:bg-surface-container-lowest"
        />
      </div>
    </div>
  );
}
