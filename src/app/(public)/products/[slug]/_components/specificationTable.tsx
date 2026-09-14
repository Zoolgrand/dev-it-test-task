import type { ReactElement } from "react";
import type { ProductAttributeView } from "@/domain/product/dto";
import { catalogMessages } from "@/content/messages/catalog";

export function SpecificationTable({
  attributes,
}: {
  attributes: ProductAttributeView[];
}): ReactElement {
  return (
    <section className="flex flex-col gap-space-sm">
      <h2 className="text-headline-lg font-semibold tracking-tight text-on-surface">
        {catalogMessages.specsHeading}
      </h2>
      <p className="text-body-sm text-on-surface-variant">{catalogMessages.specsNote}</p>
      <dl className="mt-space-sm overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        {attributes.map((attribute) => (
          <div
            key={attribute.id}
            className="flex flex-col gap-1 border-b border-outline-variant/30 px-space-md py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-space-lg"
          >
            <dt className="min-w-0 text-body-sm break-words text-on-surface-variant">
              {attribute.name}
            </dt>
            <dd className="min-w-0 text-body-sm font-medium break-words text-on-surface sm:text-right">
              {attribute.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
