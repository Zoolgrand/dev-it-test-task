import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

export function SearchFallback({ className }: { className?: string }): ReactElement {
  return <div className={cn("h-9 w-full rounded-xl bg-surface-container-low", className)} />;
}
