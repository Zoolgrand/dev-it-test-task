import type { NextRequest } from "next/server";
import { notFound } from "@/server/http/responses";
import { getPublishedProduct } from "@/server/products/service";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/products/[slug]">,
): Promise<Response> {
  const { slug } = await context.params;
  const product = await getPublishedProduct(slug);

  return product ? Response.json({ product }) : notFound();
}
