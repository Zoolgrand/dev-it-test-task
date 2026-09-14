import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { messages } from "@/lib/messages";
import { getPublishedProduct } from "@/server/products/service";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

  if (!product) {
    return {};
  }

  return { title: product.seoTitle, description: product.seoDescription };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">): Promise<ReactElement> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
      <p className="whitespace-pre-wrap text-sm">{product.description}</p>
      {product.attributes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {messages.product.attributes}
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {product.attributes.map((attribute) => (
              <div key={attribute.id} className="contents">
                <dt className="font-medium">{attribute.name}</dt>
                <dd>{attribute.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}
