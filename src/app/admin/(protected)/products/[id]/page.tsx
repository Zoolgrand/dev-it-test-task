import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { messages } from "@/lib/messages";
import { getSuggestionAvailability } from "@/server/llm";
import { getAdminProduct } from "@/server/products/service";
import { ProductEditor } from "./editor";

export default async function AdminProductPage({
  params,
}: PageProps<"/admin/products/[id]">): Promise<ReactElement> {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  const suggestionAvailability = getSuggestionAvailability();

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">{messages.product.attributes}</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {product.attributes.map((attribute) => (
            <div key={attribute.id} className="contents">
              <dt className="font-medium">{attribute.name}</dt>
              <dd>{attribute.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <ProductEditor product={product} suggestionAvailability={suggestionAvailability} />
    </>
  );
}
