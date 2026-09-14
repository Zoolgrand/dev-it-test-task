import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Clock, FileClock, Package, Pencil } from "lucide-react";
import type { ProductStatus } from "@/domain/product/status";
import { ProductStatusBadge } from "@/components/product-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { messages } from "@/lib/messages";
import { selectPlural } from "@/lib/plural";
import { formatRelativeTime } from "@/lib/relative-time";
import { listAdminProducts } from "@/server/products/service";
import type { AdminProductListItem } from "@/server/products/mappers";
import { CreateProductButton } from "./create-product-button";
import { FiltersButton, RowMenuButton, SelectRowCheckbox } from "./list-controls";
import { SearchField } from "./search-field";

type Tab = ProductStatus | "all";

const tabs: Array<{ value: Tab; label: string; shortLabel: string }> = [
  { value: "all", label: messages.adminList.tabAll, shortLabel: messages.adminList.tabAllShort },
  {
    value: "published",
    label: messages.adminList.tabPublished,
    shortLabel: messages.adminList.tabPublished,
  },
  { value: "draft", label: messages.adminList.tabDrafts, shortLabel: messages.adminList.tabDrafts },
];

function readParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function matches(product: AdminProductListItem, tab: Tab, query: string): boolean {
  if (tab !== "all" && product.status !== tab) {
    return false;
  }

  if (query === "") {
    return true;
  }

  return product.name.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query);
}

function tabHref(tab: Tab, query: string): string {
  const params = new URLSearchParams();

  if (tab !== "all") {
    params.set("status", tab);
  }

  if (query !== "") {
    params.set("q", query);
  }

  return params.size === 0 ? "/admin/products" : `/admin/products?${params.toString()}`;
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">): Promise<ReactElement> {
  const params = await searchParams;
  const statusParam = readParam(params.status);
  const activeTab: Tab =
    statusParam === "published" || statusParam === "draft" ? statusParam : "all";
  const rawQuery = readParam(params.q);
  const query = rawQuery.trim().toLowerCase();

  const products = await listAdminProducts();
  const visible = products.filter((product) => matches(product, activeTab, query));
  const publishedCount = products.filter((product) => product.status === "published").length;
  const draftCount = products.length - publishedCount;
  const publishedShare =
    products.length === 0 ? 0 : Math.round((publishedCount / products.length) * 1000) / 10;

  const counts: Record<Tab, number> = {
    all: products.length,
    published: publishedCount,
    draft: draftCount,
  };

  return (
    <div className="flex flex-col">
      <div className="mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-center">
        <div className="flex items-center justify-between gap-space-md">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="text-headline-lg tracking-tight text-on-surface">
              {messages.adminList.heading}
            </h1>
            <span className="inline-flex items-center rounded-full bg-surface-container-high px-space-xs py-0.5 font-mono text-code-sm text-on-surface-variant">
              {products.length} {selectPlural(products.length, messages.adminList.productForms)}
            </span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-surface-container px-space-sm py-1 text-label-sm text-on-surface-variant lg:flex">
            <span className="size-2 rounded-full bg-tertiary" />
            <span>{messages.adminList.catalogSynced}</span>
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
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-md shadow-sm">
          <div>
            <p className="text-label-sm text-on-surface-variant">{messages.adminList.statTotal}</p>
            <p className="mt-0.5 text-headline-md tracking-tight text-on-surface">
              {products.length}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-surface-container-low text-primary">
            <Package className="size-5" aria-hidden />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-md shadow-sm">
          <div>
            <p className="text-label-sm text-on-surface-variant">
              {messages.adminList.statPublished}
            </p>
            <div className="mt-0.5 flex items-baseline gap-space-xs">
              <p className="text-headline-md tracking-tight text-tertiary">{publishedCount}</p>
              <span className="font-mono text-code-sm text-tertiary">{publishedShare}%</span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-tertiary-fixed/30 text-tertiary">
            <CheckCircle2 className="size-5" aria-hidden />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-md shadow-sm">
          <div>
            <p className="text-label-sm text-on-surface-variant">{messages.adminList.statDrafts}</p>
            <div className="mt-0.5 flex items-baseline gap-space-xs">
              <p className="text-headline-md tracking-tight text-error">{draftCount}</p>
              <span className="text-label-sm text-on-surface-variant">
                {messages.adminList.statDraftsHint}
              </span>
            </div>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-error-container/40 text-error">
            <FileClock className="size-5" aria-hidden />
          </div>
        </div>
      </div>

      <div className="mb-space-md flex items-center gap-1.5 overflow-x-auto rounded-xl bg-surface-container p-1 md:hidden">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value, rawQuery)}
            aria-current={tab.value === activeTab ? "page" : undefined}
            className={
              tab.value === activeTab
                ? "flex min-h-9 items-center rounded-lg bg-surface-container-lowest px-3 text-label-sm text-on-surface shadow-sm"
                : "flex min-h-9 items-center rounded-lg px-3 text-label-sm text-on-surface-variant"
            }
          >
            {tab.shortLabel} ({counts[tab.value]})
          </Link>
        ))}
      </div>

      <ul className="flex w-full flex-col gap-3 md:hidden">
        {visible.map((product) => (
          <li key={product.id}>
            <article className="relative flex flex-col rounded-xl bg-surface-container-lowest p-4 shadow-sm">
              <div className="mb-2.5 flex items-start justify-between gap-space-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <ProductStatusBadge status={product.status} tone="soft" className="shrink-0" />
                  <span className="truncate font-mono text-code-sm text-on-surface-variant">
                    {product.slug}
                  </span>
                </div>
                <RowMenuButton productName={product.name} />
              </div>
              <div className="mb-3 flex gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                  <Package className="size-6" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <h2 className="line-clamp-2 text-headline-sm leading-tight text-on-surface">
                    {product.name}
                  </h2>
                  {product.category ? (
                    <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">
                      {product.category}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                  <Clock className="size-4" aria-hidden />
                  <span>{formatRelativeTime(product.updatedAt)}</span>
                </div>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-container px-4 text-label-md text-on-surface transition-all hover:bg-secondary-container"
                >
                  <Pencil className="size-[18px]" aria-hidden />
                  <span>{messages.adminList.edit}</span>
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="hidden w-full flex-col overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm md:flex">
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-space-md py-space-sm">
          <div className="flex items-center gap-space-md text-label-md text-on-surface-variant">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={tabHref(tab.value, rawQuery)}
                aria-current={tab.value === activeTab ? "page" : undefined}
                className={
                  tab.value === activeTab
                    ? "-mb-[9px] border-b-2 border-primary pb-1 text-headline-sm text-on-surface"
                    : "pb-1 text-on-surface-variant transition-colors hover:text-on-surface"
                }
              >
                {tab.value === "all" ? tab.label : `${tab.label} (${counts[tab.value]})`}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-space-xs font-mono text-code-sm text-on-surface-variant">
            <span className="hidden sm:inline">{messages.adminList.sortLabel}</span>
            <span className="inline-flex items-center gap-0.5 text-on-surface">
              {messages.adminList.sortRecent}
              <ChevronDown className="size-4" aria-hidden />
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pr-space-md pl-space-lg">
                <span className="sr-only">{messages.adminList.selectAll}</span>
                <SelectRowCheckbox label={messages.adminList.selectAll} />
              </TableHead>
              <TableHead className="px-space-md">{messages.adminList.columnName}</TableHead>
              <TableHead className="w-44">{messages.adminList.columnCategory}</TableHead>
              <TableHead className="w-36">{messages.adminList.columnStatus}</TableHead>
              <TableHead className="w-40">{messages.adminList.columnUpdated}</TableHead>
              <TableHead className="w-28 pr-space-lg pl-space-md text-right">
                {messages.adminList.columnActions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="pr-space-md pl-space-lg">
                  <SelectRowCheckbox label={`${messages.adminList.selectRow}: ${product.name}`} />
                </TableCell>
                <TableCell className="px-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container text-on-surface-variant">
                      <Package className="size-5" aria-hidden />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="truncate text-body-lg font-semibold text-on-surface transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <span className="truncate font-mono text-code-sm text-on-surface-variant">
                        {product.slug}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <span className="inline-flex items-center rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
                      {product.category}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={product.status} />
                </TableCell>
                <TableCell className="font-mono text-code-sm text-on-surface-variant">
                  {formatRelativeTime(product.updatedAt)}
                </TableCell>
                <TableCell className="pr-space-lg pl-space-md text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-outline-variant/60 bg-surface-container-lowest px-2.5 py-1 text-label-md text-on-surface shadow-sm transition-all hover:border-primary/40 hover:text-primary"
                    >
                      {messages.adminList.edit}
                    </Link>
                    <RowMenuButton productName={product.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant/40 px-space-md py-space-sm sm:flex-row">
          <div className="text-body-sm text-on-surface-variant">
            {messages.adminList.shownPrefix}{" "}
            <span className="font-medium text-on-surface">{visible.length}</span>{" "}
            {messages.adminList.shownSeparator}{" "}
            <span className="font-medium text-on-surface">{products.length}</span>{" "}
            {selectPlural(products.length, messages.adminList.recordForms)}
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-md border border-outline-variant/40 px-space-sm py-1 text-label-sm text-on-surface-variant/50">
              {messages.adminList.previousPage}
            </span>
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-label-sm font-medium text-on-primary">
              1
            </span>
            <span className="rounded-md border border-outline-variant/40 px-space-sm py-1 text-label-sm text-on-surface-variant/50">
              {messages.adminList.nextPage}
            </span>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-space-xl text-center text-body-md text-on-surface-variant">
          {products.length === 0 ? messages.adminList.empty : messages.adminList.nothingFound}
        </p>
      ) : null}
    </div>
  );
}
