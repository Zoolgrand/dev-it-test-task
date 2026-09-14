import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/require-admin";
import { notFound, unauthorized } from "@/server/http/responses";
import { getAdminProduct } from "@/server/products/service";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/admin/products/[id]">,
): Promise<Response> {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const { id } = await context.params;
  const product = await getAdminProduct(id);

  return product ? Response.json({ product }) : notFound();
}
