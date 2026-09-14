"use client";

import type { ReactElement } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";

export function CreateProductButton({ className }: { className?: string }): ReactElement {
  return (
    <Button
      type="button"
      size="sm"
      className={className}
      onClick={() => toast.info(messages.adminList.createUnavailable)}
    >
      <Plus className="size-[18px]" aria-hidden />
      <span className="hidden sm:inline">{messages.adminList.create}</span>
      <span className="sm:hidden">{messages.adminList.createShort}</span>
    </Button>
  );
}
