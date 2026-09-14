import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { catalogMessages } from "@/content/messages/catalog";
import { getPublishedProduct } from "@/server/products/service";
import { ProductBreadcrumbs } from "./_components/productBreadcrumbs";
import { ProductGallery } from "./_components/productGallery";
import { PurchasePanel } from "./_components/purchasePanel";
import { SpecificationTable } from "./_components/specificationTable";

export const revalidate = 3600;

export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

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

  const paragraphs = product.description.split(/\n{2,}/);

  return (
    <div className="flex w-full flex-col gap-space-xl">
      <ProductBreadcrumbs productName={product.name} />

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-2">
        <ProductGallery product={product} />
        <PurchasePanel product={product} />
      </div>

      <section className="flex flex-col gap-space-md">
        <h2 className="text-headline-lg font-semibold tracking-tight text-on-surface">
          {catalogMessages.descriptionHeading}
        </h2>
        <div className="flex max-w-3xl flex-col gap-space-md">
          {paragraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 24)}`}
              className="text-body-lg leading-relaxed whitespace-pre-wrap text-on-surface-variant"
            >
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-col items-start gap-space-md rounded-2xl bg-surface-container-low p-space-md sm:flex-row sm:items-center">
          <span className="flex aspect-[4/3] w-full max-w-[160px] items-center justify-center rounded-xl bg-surface-container text-outline">
            <ImageIcon className="size-8" aria-hidden />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-headline-sm text-on-surface">{product.seoTitle}</span>
            <span className="text-body-sm text-on-surface-variant">{product.seoDescription}</span>
          </span>
        </div>
      </section>

      {product.attributes.length > 0 ? (
        <SpecificationTable attributes={product.attributes} />
      ) : null}
    </div>
  );
}
