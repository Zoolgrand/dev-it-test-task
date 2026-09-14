import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">): React.JSX.Element {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full rounded-lg bg-surface-container-low p-3 text-body-md text-on-surface transition-all outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:text-on-surface-variant aria-invalid:border aria-invalid:border-error aria-invalid:focus:ring-error/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
