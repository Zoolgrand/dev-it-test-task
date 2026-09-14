import type { NextRequest } from "next/server";
import { productUpdateSchema } from "@/domain/product/schema";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  fieldErrorsFromZodError,
  notFound,
  unauthorized,
  validationFailed,
  versionConflict,
} from "@/server/http/responses";
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

  return product ? Response.json({ product }) : notFound();
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/products/[id]">,
): Promise<Response> {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const body: unknown = await request.json();
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return validationFailed(fieldErrorsFromZodError(parsed.error));
  }

  const { id } = await context.params;
  const outcome = await updateProductContent(id, parsed.data);

  switch (outcome.status) {
    case "updated":
      return Response.json({ product: outcome.product });
    case "conflict":
      return versionConflict();
    case "not_found":
      return notFound();
    case "invalid":
      return validationFailed({});
  }
}
