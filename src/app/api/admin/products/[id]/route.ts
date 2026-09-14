import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import type { AdminProductResponse } from "@/domain/api/contracts";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { bodyErrorResponse, parseJsonBody } from "@/server/http/body";
import { notFound, unauthorized, validationFailed, versionConflict } from "@/server/http/responses";
import { getAdminProduct, updateProductContent } from "@/server/products/service";

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

  if (!product) {
    return notFound();
  }

  const body: AdminProductResponse = { product };

  return Response.json(body);
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/products/[id]">,
): Promise<Response> {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const body = await parseJsonBody(request);

  if (body.status !== "ok") {
    return bodyErrorResponse(body);
  }

  const { id } = await context.params;
  const outcome = await updateProductContent(id, body.value);

  switch (outcome.status) {
    case "updated": {
      revalidatePath(`/products/${outcome.product.slug}`);
      revalidatePath(`/api/products/${outcome.product.slug}`);
      const response: AdminProductResponse = { product: outcome.product };
      return Response.json(response);
    }
    case "invalid":
      return validationFailed(outcome.fieldErrors);
    case "conflict":
      return versionConflict();
    case "not_found":
      return notFound();
  }
}
