import type { ReactElement } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import type { AdminProductListItem } from "@/domain/product/dto";
import { ProductStatusBadge } from "@/components/productStatusBadge";
import { RelativeTime } from "@/components/relativeTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListMessages } from "@/content/messages/adminList";
import { RowMenuButton, SelectRowCheckbox } from "./listActions";

export function ProductsTable({ products }: { products: AdminProductListItem[] }): ReactElement {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 pr-space-md pl-space-lg">
            <span className="sr-only">{adminListMessages.selectAll}</span>
            <SelectRowCheckbox label={adminListMessages.selectAll} />
          </TableHead>
          <TableHead className="px-space-md">{adminListMessages.columnName}</TableHead>
          <TableHead className="w-44">{adminListMessages.columnCategory}</TableHead>
          <TableHead className="w-36">{adminListMessages.columnStatus}</TableHead>
          <TableHead className="w-40">{adminListMessages.columnUpdated}</TableHead>
          <TableHead className="w-28 pr-space-lg pl-space-md text-right">
            {adminListMessages.columnActions}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="pr-space-md pl-space-lg">
              <SelectRowCheckbox label={`${adminListMessages.selectRow}: ${product.name}`} />
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
              <RelativeTime iso={product.updatedAt} />
            </TableCell>
            <TableCell className="pr-space-lg pl-space-md text-right">
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="inline-flex items-center justify-center rounded-md border border-outline-variant/60 bg-surface-container-lowest px-2.5 py-1 text-label-md text-on-surface shadow-sm transition-all hover:border-primary/40 hover:text-primary"
                >
                  {adminListMessages.edit}
                </Link>
                <RowMenuButton productName={product.name} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
