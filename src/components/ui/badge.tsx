import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent px-2.5 py-1 text-label-sm whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary",
        secondary: "bg-surface-container text-on-surface-variant",
        success: "border-success-border/60 bg-success-container text-success-foreground",
        warning: "border-warning-border/60 bg-warning-container text-warning-foreground",
        destructive: "border-error/20 bg-error-container text-on-error-container",
        outline: "border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant",
        code: "rounded-lg bg-surface-container font-mono text-code-sm text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
