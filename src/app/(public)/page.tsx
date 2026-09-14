import { Suspense } from "react";
import type { ReactElement } from "react";
import type { PublicProduct } from "@/domain/product/dto";
import { isCatalogSort } from "@/domain/product/catalogSort";
import type { CatalogSort } from "@/domain/product/catalogSort";
import { resolveCatalogWindow } from "@/domain/product/catalogWindow";
import { adminListMessages } from "@/content/messages/adminList";
import { catalogMessages } from "@/content/messages/catalog";
import { demoPrice, demoRating } from "@/content/demoCatalog";
import { selectPlural } from "@/lib/formatting/plural";
import { buildHref } from "@/lib/href";
import { readParam } from "@/lib/searchParams";
import { listPublishedCategories, listPublishedProducts } from "@/server/products/service";
import { CatalogEmptyState } from "./_components/catalogEmptyState";
import { CatalogHero } from "./_components/catalogHero";
import { CategoryChips } from "./_components/categoryChips";
import { ExpertBanner } from "./_components/expertBanner";
import { ProductCard } from "./_components/productCard";
import { ShowMoreLink } from "./_components/showMoreLink";
import { SearchFallback } from "./_components/searchFallback";
import { SortSelect } from "./_components/sortSelect";

type Comparator = (first: PublicProduct, second: PublicProduct) => number;

const demoComparators: Partial<Record<CatalogSort, Comparator>> = {
  "price-asc": (first, second) => demoPrice(first.slug) - demoPrice(second.slug),
  "price-desc": (first, second) => demoPrice(second.slug) - demoPrice(first.slug),
  rating: (first, second) => demoRating(second.slug) - demoRating(first.slug),
};

export default async function CatalogPage({ searchParams }: PageProps<"/">): Promise<ReactElement> {
  const params = await searchParams;
  const rawQuery = readParam(params.q);
  const sortParam = readParam(params.sort);
  const sort: CatalogSort = isCatalogSort(sortParam) ? sortParam : "popular";
  const category = readParam(params.category);

  const demoComparator = demoComparators[sort];
  const catalogWindow = resolveCatalogWindow(readParam(params.shown), demoComparator !== undefined);
  const [categories, page] = await Promise.all([
    listPublishedCategories(),
    listPublishedProducts({
      category,
      query: rawQuery,
      sort: sort === "new" ? "newest" : "name",
      take: catalogWindow.scan,
    }),
  ]);

  const visible = demoComparator
    ? [...page.items].sort(demoComparator).slice(0, catalogWindow.limit)
    : page.items;
  const remaining = page.total - visible.length;

  const kept = new URLSearchParams();
  if (rawQuery !== "") kept.set("q", rawQuery);
  if (sort !== "popular") kept.set("sort", sort);
  if (category !== "") kept.set("category", category);

  return (
    <div className="flex w-full flex-col">
      <CatalogHero />

      <div className="flex flex-col gap-space-md pb-space-lg">
        <CategoryChips
          categories={categories}
          active={category}
          hrefFor={(value) => buildHref("/", kept, { category: value, shown: null })}
        />

        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-semibold text-on-surface">
              {catalogMessages.found} {page.total}{" "}
              {selectPlural(page.total, adminListMessages.productForms)}
            </span>
            <span className="size-1 rounded-full bg-outline-variant" />
            <span className="text-body-sm text-on-surface-variant">
              {page.total === 0 ? catalogMessages.availabilityEmpty : catalogMessages.availability}
            </span>
          </div>
          <Suspense fallback={<SearchFallback className="h-9 w-48" />}>
            <SortSelect value={sort} />
          </Suspense>
        </div>
      </div>

      {visible.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <>
          <ul className="grid w-full grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <li key={product.slug} className="flex">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          {remaining > 0 && catalogWindow.nextLimit !== null ? (
            <div className="mt-space-xl flex justify-center pt-space-lg">
              <ShowMoreLink
                href={buildHref("/", kept, { shown: String(catalogWindow.nextLimit) })}
                remaining={remaining}
              />
            </div>
          ) : null}
        </>
      )}

      <ExpertBanner />
    </div>
  );
}
