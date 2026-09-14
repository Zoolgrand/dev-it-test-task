"use client";

import type { ReactElement, ReactNode } from "react";
import { toast } from "sonner";

export function DemoAction({
  message,
  className,
  label,
  title,
  children,
}: {
  message: string;
  className?: string;
  label?: string;
  title?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onClick={() => toast.info(message)}
      className={className}
    >
      {children}
    </button>
  );
}
