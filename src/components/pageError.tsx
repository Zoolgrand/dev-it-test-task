"use client";

import type { ReactElement } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { feedbackMessages } from "@/content/messages/feedback";

export function PageError({ onRetry }: { onRetry: () => void }): ReactElement {
  return (
    <div className="flex w-full flex-col items-center gap-space-md py-space-xl text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-error-container text-error">
        <AlertTriangle className="size-7" aria-hidden />
      </span>
      <h1 className="text-headline-md text-on-surface">{feedbackMessages.errorHeading}</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">{feedbackMessages.errorNote}</p>
      <Button type="button" onClick={onRetry}>
        {feedbackMessages.retry}
      </Button>
    </div>
  );
}
