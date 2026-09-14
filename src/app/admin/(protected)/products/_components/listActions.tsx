"use client";

import type { ReactElement } from "react";
import { MoreVertical, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DemoAction } from "@/components/demoAction";
import { Button } from "@/components/ui/button";
import { adminListMessages } from "@/content/messages/adminList";
import { useToggle } from "@/hooks/useToggle";
import { cn } from "@/lib/utils";

export function FiltersButton(): ReactElement {
  return (
    <DemoAction
      message={adminListMessages.filtersUnavailable}
      className="flex h-9 items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-space-sm text-label-md text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container-low hover:text-on-surface"
    >
      <SlidersHorizontal className="size-[18px]" aria-hidden />
      <span className="hidden sm:inline">{adminListMessages.filters}</span>
    </DemoAction>
  );
}

export function RowMenuButton({ productName }: { productName: string }): ReactElement {
  return (
    <DemoAction
      message={adminListMessages.rowMenuUnavailable}
      label={`${adminListMessages.rowMenu}: ${productName}`}
      className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <MoreVertical className="size-5" aria-hidden />
    </DemoAction>
  );
}

export function CreateProductButton({ className }: { className?: string }): ReactElement {
  return (
    <Button
      type="button"
      size="sm"
      className={className}
      onClick={() => toast.info(adminListMessages.createUnavailable)}
    >
      <Plus className="size-[18px]" aria-hidden />
      <span className="hidden sm:inline">{adminListMessages.create}</span>
      <span className="sm:hidden">{adminListMessages.createShort}</span>
    </Button>
  );
}

export function SelectRowCheckbox({
  label,
  className,
}: {
  label: string;
  className?: string;
}): ReactElement {
  const { isOn, toggle } = useToggle();

  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={isOn}
      onChange={toggle}
      className={cn(
        "size-4 cursor-pointer rounded border-outline-variant text-primary accent-primary",
        className,
      )}
    />
  );
}
