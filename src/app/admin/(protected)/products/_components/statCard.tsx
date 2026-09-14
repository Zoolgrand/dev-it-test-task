import type { ReactElement, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  note,
  Icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  Icon: LucideIcon;
  tone: "neutral" | "positive" | "attention";
}): ReactElement {
  const valueTone = {
    neutral: "text-on-surface",
    positive: "text-tertiary",
    attention: "text-error",
  }[tone];
  const iconTone = {
    neutral: "bg-surface-container-low text-primary",
    positive: "bg-tertiary-fixed/30 text-tertiary",
    attention: "bg-error-container/40 text-error",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-md shadow-sm">
      <div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-space-xs">
          <p className={cn("text-headline-md tracking-tight", valueTone)}>{value}</p>
          {note}
        </div>
      </div>
      <div className={cn("flex size-10 items-center justify-center rounded-lg", iconTone)}>
        <Icon className="size-5" aria-hidden />
      </div>
    </div>
  );
}
