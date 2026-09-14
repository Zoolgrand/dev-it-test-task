import type { ReactElement } from "react";
import type { ProductStatus } from "@/domain/product/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusMessages } from "@/content/messages/status";

const dotClassName: Record<ProductStatus, string> = {
  published: "bg-success",
  draft: "bg-warning",
};

const softClassName: Record<ProductStatus, string> = {
  published: "bg-surface-container-low text-tertiary",
  draft: "bg-surface-container-low text-warning-foreground",
};

export function ProductStatusBadge({
  status,
  tone = "solid",
  className,
}: {
  status: ProductStatus;
  tone?: "solid" | "soft";
  className?: string;
}): ReactElement {
  return (
    <Badge
      variant={status === "published" ? "success" : "warning"}
      className={cn(tone === "soft" && `border-transparent ${softClassName[status]}`, className)}
    >
      <span className={cn("size-1.5 rounded-full", dotClassName[status])} />
      {statusMessages[status]}
    </Badge>
  );
}
