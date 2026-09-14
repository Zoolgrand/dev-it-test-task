"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildHref } from "@/lib/href";
import type { SearchParamPatch } from "@/lib/href";

const DEFAULT_DELAY_MS = 300;

export type DebouncedSearchParamOptions = {
  delayMs?: number;
  resets?: readonly string[];
};

export function useDebouncedSearchParam(
  key: string,
  options: DebouncedSearchParamOptions = {},
): { value: string; setValue: (next: string) => void } {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(key) ?? "");
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const resetKeys = options.resets?.join(",") ?? "";

  useEffect(() => {
    if ((searchParams.get(key) ?? "") === value) {
      return;
    }

    const timer = setTimeout(() => {
      const patch: SearchParamPatch = { [key]: value };

      for (const reset of resetKeys === "" ? [] : resetKeys.split(",")) {
        patch[reset] = null;
      }

      router.replace(buildHref(pathname, searchParams, patch));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, key, pathname, resetKeys, router, searchParams, value]);

  return { value, setValue };
}
