import { listPublishedProducts } from "@/server/products/service";

export async function GET(): Promise<Response> {
  return Response.json({ products: await listPublishedProducts() });
}
