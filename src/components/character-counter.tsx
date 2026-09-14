import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

export function CharacterCounter({ value, max }: { value: string; max: number }): ReactElement {
  const length = value.length;

  return (
    <span
      className={cn(
        "shrink-0 font-mono text-code-sm font-medium text-outline",
        length > max * 0.9 && "text-warning-foreground",
        length > max && "font-bold text-error",
      )}
    >
      {`${length}/${max}`}
    </span>
  );
}
