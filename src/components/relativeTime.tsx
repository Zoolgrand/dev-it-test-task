"use client";

import { useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { formatRelativeTime } from "@/lib/formatting/relativeTime";

function subscribe(): () => void {
  return () => {};
}

export function RelativeTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}): ReactElement {
  const label = useSyncExternalStore(
    subscribe,
    () => formatRelativeTime(iso),
    () => formatRelativeTime(iso, new Date(iso)),
  );

  return (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  );
}
