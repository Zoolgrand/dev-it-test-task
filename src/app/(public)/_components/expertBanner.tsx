import type { ReactElement } from "react";
import { DemoAction } from "@/components/demoAction";
import { catalogMessages } from "@/content/messages/catalog";

export function ExpertBanner(): ReactElement {
  return (
    <section className="mt-space-xl flex flex-col items-start justify-between gap-space-md rounded-2xl bg-surface-container-low p-space-lg md:flex-row md:items-center">
      <div className="max-w-xl space-y-1">
        <h2 className="text-headline-md font-semibold text-on-surface">
          {catalogMessages.expertHeading}
        </h2>
        <p className="text-body-md text-on-surface-variant">{catalogMessages.expertText}</p>
      </div>
      <div className="flex shrink-0 items-center gap-space-sm">
        <DemoAction
          message={catalogMessages.expertUnavailable}
          className="rounded-xl bg-on-surface px-5 py-2.5 text-label-md text-surface shadow-sm transition-colors hover:bg-on-surface/90"
        >
          {catalogMessages.expertAction}
        </DemoAction>
      </div>
    </section>
  );
}
