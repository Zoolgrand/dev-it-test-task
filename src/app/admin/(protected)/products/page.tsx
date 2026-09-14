import type { ReactElement } from "react";
import { CheckCircle2, ChevronDown, FileClock, Package } from "lucide-react";
import { adminListMessages } from "@/content/messages/adminList";
import { ADMIN_PAGE_SIZE } from "@/domain/api/pagination";
import { selectPlural } from "@/lib/formatting/plural";
import { buildHref } from "@/lib/href";
import { readParam } from "@/lib/searchParams";
import { listAdminProducts } from "@/server/products/service";
import { CreateProductButton, FiltersButton } from "./_components/listActions";
import { PaginationNav } from "./_components/paginationNav";
import { ProductCardList } from "./_components/productCardList";
import { ProductsTable } from "./_components/productsTable";
import { SearchField } from "./_components/searchField";
import { StatCard } from "./_components/statCard";
import { StatusTabs } from "./_components/statusTabs";
import type { ListTab } from "./_components/statusTabs";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">): Promise<ReactElement> {
  const params = await searchParams;
  const statusParam = readParam(params.status);
  const activeTab: ListTab =
    statusParam === "published" || statusParam === "draft" ? statusParam : "all";
  const rawQuery = readParam(params.q);
  const requestedPage = Number.parseInt(readParam(params.page), 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { items, total, publishedCount, draftCount } = await listAdminProducts({
    status: activeTab === "all" ? undefined : activeTab,
    query: rawQuery,
    skip: (currentPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const allCount = publishedCount + draftCount;
  const publishedShare = allCount === 0 ? 0 : Math.round((publishedCount / allCount) * 1000) / 10;

  const counts: Record<ListTab, number> = {
    all: allCount,
    published: publishedCount,
    draft: draftCount,
  };

  const kept = new URLSearchParams();
  if (rawQuery !== "") kept.set("q", rawQuery);

  const tabHref = (tab: ListTab): string =>
    buildHref("/admin/products", kept, { status: tab === "all" ? null : tab, page: null });

  const pageHref = (target: number): string =>
    buildHref("/admin/products", kept, {
      status: activeTab === "all" ? null : activeTab,
      page: target === 1 ? null : String(target),
    });

  return (
    <div className="flex flex-col">
      <div className="mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-center">
        <div className="flex items-center justify-between gap-space-md">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="text-headline-lg tracking-tight text-on-surface">
              {adminListMessages.heading}
            </h1>
            <span className="inline-flex items-center rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-sm text-on-surface-variant">
              {allCount} {selectPlural(allCount, adminListMessages.productForms)}
            </span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-surface-container px-space-sm py-1 text-label-sm text-on-surface-variant lg:flex">
            <span className="size-2 rounded-full bg-tertiary" />
            <span>{adminListMessages.catalogSynced}</span>
          </div>
          <CreateProductButton className="h-10 rounded-xl md:hidden" />
        </div>
        <div className="hidden items-center gap-space-sm md:flex">
          <SearchField className="md:w-64 lg:w-72" />
          <FiltersButton />
          <CreateProductButton className="h-9" />
        </div>
      </div>

      <div className="mb-space-lg hidden gap-space-md md:grid md:grid-cols-3">
        <StatCard
          label={adminListMessages.statTotal}
          value={allCount}
          Icon={Package}
          tone="neutral"
        />
        <StatCard
          label={adminListMessages.statPublished}
          value={publishedCount}
          note={<span className="font-mono text-code-sm text-tertiary">{publishedShare}%</span>}
          Icon={CheckCircle2}
          tone="positive"
        />
        <StatCard
          label={adminListMessages.statDrafts}
          value={draftCount}
          note={
            <span className="text-label-sm text-on-surface-variant">
              {adminListMessages.statDraftsHint}
            </span>
          }
          Icon={FileClock}
          tone="attention"
        />
      </div>

      <div className="mb-space-md flex items-center gap-1.5 overflow-x-auto rounded-xl bg-surface-container p-1 md:hidden">
        <StatusTabs active={activeTab} counts={counts} hrefFor={tabHref} variant="pills" />
      </div>

      <ProductCardList products={items} />

      <div className="flex justify-center pt-space-md md:hidden">
        <PaginationNav page={currentPage} pageCount={pageCount} hrefFor={pageHref} />
      </div>

      <div className="hidden w-full flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm md:flex">
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-space-md py-space-sm">
          <div className="flex items-center gap-space-md text-label-md text-on-surface-variant">
            <StatusTabs active={activeTab} counts={counts} hrefFor={tabHref} variant="underline" />
          </div>
          <div className="flex items-center gap-space-xs font-mono text-code-sm text-on-surface-variant">
            <span className="hidden sm:inline">{adminListMessages.sortLabel}</span>
            <span className="inline-flex items-center gap-0.5 text-on-surface">
              {adminListMessages.sortRecent}
              <ChevronDown className="size-4" aria-hidden />
            </span>
          </div>
        </div>

        <ProductsTable products={items} />

        <div className="flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant/40 px-space-md py-space-sm sm:flex-row">
          <div className="text-body-sm text-on-surface-variant">
            {adminListMessages.shownPrefix}{" "}
            <span className="font-medium text-on-surface">{items.length}</span>{" "}
            {adminListMessages.shownSeparator}{" "}
            <span className="font-medium text-on-surface">{total}</span>{" "}
            {selectPlural(total, adminListMessages.recordForms)}
          </div>
          <PaginationNav page={currentPage} pageCount={pageCount} hrefFor={pageHref} />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-space-xl text-center text-body-md text-on-surface-variant">
          {allCount === 0 ? adminListMessages.empty : adminListMessages.nothingFound}
        </p>
      ) : null}
    </div>
  );
}
