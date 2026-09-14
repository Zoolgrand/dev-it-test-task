import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent text-label-md font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-60 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary shadow-sm hover:bg-primary-container active:scale-[0.99]",
        outline:
          "border-outline-variant/60 bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low",
        secondary:
          "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        ghost: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        destructive:
          "text-on-surface-variant hover:bg-error-container/40 hover:text-error focus-visible:ring-error/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2.5 text-label-sm",
        sm: "h-8 px-3",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }): React.JSX.Element {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
