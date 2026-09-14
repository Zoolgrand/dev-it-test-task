import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

export function CharacterCounter({ value, max }: { value: string; max: number }): ReactElement {
  const length = value.length;

  return (
    <span className={cn("text-xs text-muted-foreground", length > max && "text-destructive")}>
      {`${length}/${max}`}
    </span>
  );
}
