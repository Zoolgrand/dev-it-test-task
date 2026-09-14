import type { ReactElement } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { feedbackMessages } from "@/content/messages/feedback";

export default function NotFound(): ReactElement {
  return (
    <div className="flex w-full flex-col items-center gap-space-md py-space-xl text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
        <PackageOpen className="size-8" aria-hidden />
      </span>
      <h1 className="text-headline-md text-on-surface">{feedbackMessages.notFoundHeading}</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        {feedbackMessages.notFoundNote}
      </p>
      <Link
        href="/"
        className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-label-md text-on-primary"
      >
        {feedbackMessages.backToCatalog}
      </Link>
    </div>
  );
}
