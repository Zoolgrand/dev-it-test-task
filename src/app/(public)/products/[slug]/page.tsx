import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  CreditCard,
  Image as ImageIcon,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { messages } from "@/lib/messages";
import {
  demoArticle,
  demoHighlight,
  demoPrice,
  demoPriceBeforeDiscount,
  demoRating,
  demoReviewCount,
  formatPrice,
} from "@/lib/demo-catalog";
import { getPublishedProduct } from "@/server/products/service";
import {
  AddToCartButton,
  FavouriteToggle,
  QuickOrderButton,
  ShareButton,
} from "../../catalog-controls";

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

  const price = demoPrice(product.slug);
  const rating = demoRating(product.slug);
  const reviews = demoReviewCount(product.slug);
  const paragraphs = product.description.split(/\n{2,}/);

  return (
    <div className="flex w-full flex-col gap-space-xl">
      <div className="flex items-center justify-between gap-space-md">
        <nav
          aria-label={messages.catalog.heading}
          className="flex min-w-0 items-center gap-space-xs text-label-sm text-on-surface-variant"
        >
          <Link href="/" className="transition-colors hover:text-primary">
            {messages.catalog.breadcrumbHome}
          </Link>
          <ChevronRight className="size-4 shrink-0 text-outline-variant" aria-hidden />
          <Link href="/" className="transition-colors hover:text-primary">
            {messages.catalog.heading}
          </Link>
          <ChevronRight className="size-4 shrink-0 text-outline-variant" aria-hidden />
          <span className="truncate font-medium text-on-surface">{product.name}</span>
        </nav>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1 text-label-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {messages.catalog.backToCatalog}
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-2">
        <div className="flex flex-col gap-space-md">
          <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low text-outline">
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold text-primary shadow-sm backdrop-blur-md">
                {demoHighlight(product.slug)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold text-tertiary shadow-sm backdrop-blur-md">
                <BadgeCheck className="size-3.5" aria-hidden />
                {messages.catalog.guarantee}
              </span>
            </div>
            <Package className="size-20" aria-hidden />
            <FavouriteToggle productName={product.name} />
          </div>

          <div className="flex items-center justify-between gap-space-sm text-body-sm">
            <span className="flex items-center gap-1.5 text-tertiary">
              <span className="size-2 rounded-full bg-tertiary" />
              {messages.catalog.inStock}
            </span>
            <span className="text-on-surface-variant">{messages.catalog.shipping}</span>
          </div>

          <ul className="grid grid-cols-4 gap-space-sm">
            {[0, 1, 2, 3].map((index) => (
              <li
                key={index}
                className={
                  index === 0
                    ? "flex aspect-square items-center justify-center rounded-xl bg-surface-container-low text-outline ring-2 ring-primary"
                    : "flex aspect-square items-center justify-center rounded-xl bg-surface-container-low text-outline"
                }
              >
                <ImageIcon className="size-6" aria-hidden />
              </li>
            ))}
          </ul>

          {product.attributes.length > 0 ? (
            <ul className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
              {product.attributes.slice(0, 3).map((attribute) => (
                <li
                  key={attribute.id}
                  className="flex min-w-0 flex-col gap-1 rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                >
                  <Check className="size-4 text-primary" aria-hidden />
                  <span className="text-headline-sm break-words hyphens-auto text-on-surface">
                    {attribute.value}
                  </span>
                  <span className="text-label-sm break-words text-on-surface-variant">
                    {attribute.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary-fixed/40 px-2 py-0.5 font-mono text-code-sm text-primary">
              {product.attributes[0]?.name ?? messages.product.attributes}
            </span>
            <span className="font-mono text-code-sm text-on-surface-variant">
              {messages.catalog.article} {demoArticle(product.slug)}
            </span>
            <span className="ml-auto font-mono text-code-sm text-outline">{product.slug}</span>
          </div>

          <h1 className="text-display font-semibold tracking-tight text-on-surface">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-0.5 text-warning">
              {[1, 2, 3, 4, 5].map((position) => (
                <Star
                  key={position}
                  className={
                    position <= Math.round(rating)
                      ? "size-4 fill-warning text-warning"
                      : "size-4 text-outline-variant"
                  }
                  aria-hidden
                />
              ))}
            </span>
            <span className="font-medium text-on-surface">{rating.toFixed(1)}</span>
            <span className="size-1 rounded-full bg-outline-variant" />
            <span>
              {reviews} {messages.catalog.reviews}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-space-sm">
            <span className="text-display font-bold text-primary">{formatPrice(price)}</span>
            <span className="text-body-lg text-outline line-through">
              {formatPrice(demoPriceBeforeDiscount(product.slug))}
            </span>
            <span className="rounded-full bg-error-container px-2 py-0.5 text-label-sm font-medium text-on-error-container">
              {messages.catalog.discount}
            </span>
          </div>

          {product.attributes.length > 0 ? (
            <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-space-md">
              <span className="text-label-md font-semibold text-on-surface">
                {messages.catalog.highlightsHeading}
              </span>
              <ul className="flex flex-col gap-1.5">
                {product.attributes.slice(0, 4).map((attribute) => (
                  <li key={attribute.id} className="flex items-start gap-2 text-body-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-on-surface-variant">
                      {attribute.name}: <span className="text-on-surface">{attribute.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex items-center gap-space-sm">
            <AddToCartButton />
            <ShareButton productName={product.name} />
          </div>
          <QuickOrderButton />

          <ul className="flex flex-col gap-space-sm pt-space-xs">
            <li className="flex items-start gap-space-sm">
              <Truck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span className="flex flex-col">
                <span className="text-label-md text-on-surface">
                  {messages.catalog.deliveryTitle}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {messages.catalog.deliveryNote}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-space-sm">
              <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span className="flex flex-col">
                <span className="text-label-md text-on-surface">
                  {messages.catalog.paymentTitle}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {messages.catalog.paymentNote}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-space-sm">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span className="flex flex-col">
                <span className="text-label-md text-on-surface">
                  {messages.catalog.warrantyTitle}
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  {messages.catalog.warrantyNote}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <section className="flex flex-col gap-space-md">
        <h2 className="text-headline-lg font-semibold tracking-tight text-on-surface">
          {messages.catalog.descriptionHeading}
        </h2>
        <div className="flex max-w-3xl flex-col gap-space-md">
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph}
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
        <section className="flex flex-col gap-space-sm">
          <h2 className="text-headline-lg font-semibold tracking-tight text-on-surface">
            {messages.catalog.specsHeading}
          </h2>
          <p className="text-body-sm text-on-surface-variant">{messages.catalog.specsNote}</p>
          <dl className="mt-space-sm overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
            {product.attributes.map((attribute) => (
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
      ) : null}
    </div>
  );
}
