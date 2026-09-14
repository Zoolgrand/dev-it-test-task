import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Home, Package, PackageOpen } from "lucide-react";
import type { PublicProduct } from "@/server/products/mappers";
import { messages } from "@/lib/messages";
import { selectPlural } from "@/lib/plural";
import { demoArticle, demoHighlight, demoPrice, demoRating, formatPrice } from "@/lib/demo-catalog";
import { listPublishedProducts } from "@/server/products/service";
import { ExpertButton, FavouriteToggle, RefreshButton, SortSelect } from "./catalog-controls";
import { isCatalogSort } from "./catalog-sort";
import type { CatalogSort } from "./catalog-sort";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function sortProducts(products: PublicProduct[], sort: CatalogSort): PublicProduct[] {
  const sorted = [...products];

  if (sort === "price-asc") {
    return sorted.sort((first, second) => demoPrice(first.slug) - demoPrice(second.slug));
  }

  if (sort === "price-desc") {
    return sorted.sort((first, second) => demoPrice(second.slug) - demoPrice(first.slug));
  }

  if (sort === "rating") {
    return sorted.sort((first, second) => demoRating(second.slug) - demoRating(first.slug));
  }

  if (sort === "new") {
    return sorted.reverse();
  }

  return sorted;
}

function categoriesOf(products: PublicProduct[]): string[] {
  const names = new Set<string>();

  for (const product of products) {
    const first = product.attributes[0];

    if (first) {
      names.add(first.name);
    }
  }

  return [...names];
}

function linkTo(params: URLSearchParams): string {
  return params.size === 0 ? "/" : `/?${params.toString()}`;
}

export default async function CatalogPage({ searchParams }: PageProps<"/">): Promise<ReactElement> {
  const params = await searchParams;
  const query = readParam(params.q).trim().toLowerCase();
  const sortParam = readParam(params.sort);
  const sort: CatalogSort = isCatalogSort(sortParam) ? sortParam : "popular";
  const category = readParam(params.category);
  const shown = Number.parseInt(readParam(params.shown), 10);
  const limit = Number.isFinite(shown) && shown > 0 ? shown : PAGE_SIZE;

  const published = await listPublishedProducts();
  const categories = categoriesOf(published);
  const filtered = published.filter((product) => {
    const matchesCategory =
      category === "" || product.attributes.some((attribute) => attribute.name === category);
    const matchesQuery =
      query === "" ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });
  const sorted = sortProducts(filtered, sort);
  const visible = sorted.slice(0, limit);
  const remaining = sorted.length - visible.length;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  function chipHref(value: string): string {
    const next = new URLSearchParams();

    if (value !== "") {
      next.set("category", value);
    }

    if (query !== "") {
      next.set("q", readParam(params.q));
    }

    if (sort !== "popular") {
      next.set("sort", sort);
    }

    return linkTo(next);
  }

  function showMoreHref(): string {
    const next = new URLSearchParams();

    if (category !== "") {
      next.set("category", category);
    }

    if (query !== "") {
      next.set("q", readParam(params.q));
    }

    if (sort !== "popular") {
      next.set("sort", sort);
    }

    next.set("shown", String(limit + PAGE_SIZE));

    return linkTo(next);
  }

  return (
    <div className="flex w-full flex-col">
      <nav
        aria-label={messages.catalog.heading}
        className="mb-space-sm flex items-center gap-space-xs text-label-sm text-on-surface-variant"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          {messages.catalog.breadcrumbHome}
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="font-medium text-on-surface">{messages.catalog.heading}</span>
      </nav>

      <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div className="max-w-3xl space-y-space-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {messages.catalog.badge}
          </span>
          <h1 className="text-display font-semibold tracking-tight text-on-surface">
            {messages.catalog.heading}
          </h1>
          <p className="text-body-lg leading-relaxed text-on-surface-variant">
            {messages.catalog.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm self-start md:self-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1.5 text-label-sm text-tertiary">
            <BadgeCheck className="size-4" aria-hidden />
            {messages.catalog.guarantee}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-space-md pb-space-lg">
        <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs">
          <Link
            href={chipHref("")}
            aria-current={category === "" ? "page" : undefined}
            className={
              category === ""
                ? "shrink-0 rounded-full bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm transition-all"
                : "shrink-0 rounded-full bg-surface-container px-4 py-2 text-label-md text-on-surface transition-all hover:bg-surface-container-high"
            }
          >
            {messages.catalog.categoryAll}
          </Link>
          {categories.map((name) => (
            <Link
              key={name}
              href={chipHref(name)}
              aria-current={category === name ? "page" : undefined}
              className={
                category === name
                  ? "shrink-0 rounded-full bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm transition-all"
                  : "shrink-0 rounded-full bg-surface-container px-4 py-2 text-label-md text-on-surface transition-all hover:bg-surface-container-high"
              }
            >
              {name}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-semibold text-on-surface">
              {messages.catalog.found} {sorted.length}{" "}
              {selectPlural(sorted.length, messages.adminList.productForms)}
            </span>
            <span className="size-1 rounded-full bg-outline-variant" />
            <span className="text-body-sm text-on-surface-variant">
              {sorted.length === 0
                ? messages.catalog.availabilityEmpty
                : messages.catalog.availability}
            </span>
          </div>
          <SortSelect value={sort} />
        </div>
      </div>

      {visible.length === 0 ? (
        <section className="flex flex-col items-center gap-space-md rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
            <PackageOpen className="size-8" aria-hidden />
          </span>
          <h2 className="text-headline-md font-semibold text-on-surface">
            {messages.catalog.empty}
          </h2>
          <p className="max-w-md text-body-md text-on-surface-variant">
            {messages.catalog.emptyNote}
          </p>
          <div className="flex w-full max-w-sm flex-col gap-space-sm">
            <RefreshButton />
            <Link
              href="/"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/60 px-4 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <Home className="size-[18px]" aria-hidden />
              {messages.catalog.emptyHome}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <ul className="grid w-full grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <li key={product.slug} className="flex">
                <article className="group flex w-full flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-container-low text-outline">
                    <Package
                      className="size-14 transition-transform duration-500 group-hover:scale-105"
                      aria-hidden
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-semibold text-primary shadow-sm backdrop-blur-md">
                        {demoHighlight(product.slug)}
                      </span>
                    </div>
                    <FavouriteToggle productName={product.name} />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-space-md p-space-md">
                    <div className="space-y-space-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-fixed/40 px-2 py-0.5 font-mono text-code-sm text-primary">
                          {product.attributes[0]?.name ?? messages.product.attributes}
                        </span>
                        <span className="text-body-sm text-outline">
                          {messages.catalog.article} {demoArticle(product.slug)}
                        </span>
                      </div>
                      <h2 className="text-headline-md text-on-surface transition-colors group-hover:text-primary">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h2>
                      <p className="line-clamp-2 text-body-sm leading-relaxed text-on-surface-variant">
                        {product.description}
                      </p>
                    </div>
                    <div className="space-y-space-sm pt-space-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {product.attributes.slice(0, 3).map((attribute) => (
                          <span
                            key={attribute.id}
                            className="max-w-full rounded-md bg-surface-container px-2 py-0.5 font-mono text-code-sm break-words text-on-surface-variant"
                          >
                            {attribute.value}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-space-xs">
                        <span className="text-headline-lg font-bold text-on-surface">
                          {formatPrice(demoPrice(product.slug))}
                        </span>
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center gap-1 text-label-md font-semibold text-primary transition-colors hover:text-primary-container"
                        >
                          {messages.catalog.view}
                          <ArrowRight className="size-[18px]" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <div className="mt-space-xl flex flex-col items-center justify-between gap-space-md pt-space-lg sm:flex-row">
            <div className="flex items-center gap-2">
              {remaining > 0 ? (
                <Link
                  href={showMoreHref()}
                  className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2 text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
                >
                  <ChevronRight className="size-[18px]" aria-hidden />
                  {messages.catalog.showMore} {remaining}{" "}
                  {selectPlural(remaining, messages.adminList.productForms)}
                </Link>
              ) : null}
            </div>
            <nav aria-label={messages.catalog.heading} className="flex items-center gap-1.5">
              {Array.from({ length: pageCount }, (unused, index) => index + 1).map((page) => (
                <span
                  key={page}
                  aria-current={page === 1 ? "page" : undefined}
                  className={
                    page === 1
                      ? "flex size-9 items-center justify-center rounded-xl bg-primary text-label-md font-semibold text-on-primary shadow-sm"
                      : "flex size-9 items-center justify-center rounded-xl bg-surface-container-lowest text-label-md text-on-surface-variant"
                  }
                >
                  {page}
                </span>
              ))}
              <span
                aria-label={messages.catalog.nextPage}
                className="flex size-9 items-center justify-center rounded-xl bg-surface-container-lowest text-on-surface-variant"
              >
                <ChevronRight className="size-[18px]" aria-hidden />
              </span>
            </nav>
          </div>
        </>
      )}

      <section className="mt-space-xl flex flex-col items-start justify-between gap-space-md rounded-2xl bg-surface-container-low p-space-lg md:flex-row md:items-center">
        <div className="max-w-xl space-y-1">
          <h3 className="text-headline-md font-semibold text-on-surface">
            {messages.catalog.expertHeading}
          </h3>
          <p className="text-body-md text-on-surface-variant">{messages.catalog.expertText}</p>
        </div>
        <div className="flex shrink-0 items-center gap-space-sm">
          <ExpertButton />
        </div>
      </section>
    </div>
  );
}
