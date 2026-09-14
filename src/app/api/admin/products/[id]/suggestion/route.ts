import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  notFound,
  providerUnavailable,
  rateLimited,
  unauthorized,
  validationFailed,
} from "@/server/http/responses";
import { getSuggestionProvider } from "@/server/llm";
import { getAdminProduct } from "@/server/products/service";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/products/[id]/suggestion">,
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

  const provider = getSuggestionProvider();
  const outcome = await provider.suggest(
    { name: product.name, attributes: product.attributes },
    request.signal,
  );

  switch (outcome.status) {
    case "ok":
      return Response.json({ suggestion: outcome.suggestion, mode: provider.mode });
    case "unusable":
      return validationFailed({});
    case "rate_limited":
      return rateLimited();
    case "unavailable":
      return providerUnavailable();
  }
}
