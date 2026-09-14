import type { ReactElement } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { messages } from "@/lib/messages";
import { listPublishedProducts } from "@/server/products/service";

export const dynamic = "force-dynamic";

export default async function CatalogPage(): Promise<ReactElement> {
  const products = await listPublishedProducts();

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{messages.catalog.heading}</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">{messages.catalog.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.slug}>
              <Link href={`/products/${product.slug}`} className="block h-full">
                <Card className="h-full transition hover:ring-2 hover:ring-primary">
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
