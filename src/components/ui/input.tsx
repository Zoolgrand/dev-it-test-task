import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">): React.JSX.Element {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg bg-surface-container-low px-3 py-2 text-body-md text-on-surface transition-all outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:text-on-surface-variant aria-invalid:border aria-invalid:border-error aria-invalid:focus:ring-error/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
