import type { ReactElement } from "react";
import type { ProductAttributeView } from "@/domain/product/dto";
import { productMessages } from "@/content/messages/product";

export function AttributesCard({
  attributes,
}: {
  attributes: ProductAttributeView[];
}): ReactElement {
  return (
    <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-sm text-on-surface">{productMessages.attributes}</h2>
        <span className="text-label-sm text-outline">{productMessages.attributesSource}</span>
      </div>
      <dl className="flex flex-col gap-2 text-body-sm">
        {attributes.map((attribute) => (
          <div
            key={attribute.id}
            className="flex justify-between gap-space-sm border-b border-surface-container-high/60 py-1 last:border-b-0"
          >
            <dt className="min-w-0 break-words text-on-surface-variant">{attribute.name}</dt>
            <dd className="min-w-0 text-right font-medium break-words text-on-surface">
              {attribute.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
