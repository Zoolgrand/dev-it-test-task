import type { ReactElement } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { messages } from "@/lib/messages";
import { listAdminProducts } from "@/server/products/service";

export default async function AdminProductsPage(): Promise<ReactElement> {
  const products = await listAdminProducts();

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{messages.adminList.heading}</h1>
      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((product) => (
          <li key={product.id} className="flex flex-col gap-2 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{product.name}</span>
              <Badge variant={product.status === "published" ? "default" : "secondary"}>
                {messages.status[product.status]}
              </Badge>
            </div>
            <Link href={`/admin/products/${product.id}`} className="text-sm text-primary underline">
              {messages.adminList.edit}
            </Link>
          </li>
        ))}
      </ul>
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>{messages.product.name}</TableHead>
            <TableHead>{messages.product.status}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <Badge variant={product.status === "published" ? "default" : "secondary"}>
                  {messages.status[product.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/admin/products/${product.id}`} className="text-primary underline">
                  {messages.adminList.edit}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
