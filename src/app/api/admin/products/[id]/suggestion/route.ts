import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { notFound, providerUnavailable, rateLimited, unauthorized } from "@/server/http/responses";
import { requestSuggestion } from "@/server/products/suggestionService";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/admin/products/[id]/suggestion">,
): Promise<Response> {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const { id } = await context.params;
  const outcome = await requestSuggestion({
    productId: id,
    userId: admin.id,
    signal: request.signal,
  });

  switch (outcome.status) {
    case "ok":
      return Response.json({ suggestion: outcome.suggestion, mode: outcome.mode });
    case "not_found":
      return notFound();
    case "rate_limited":
      return rateLimited();
    case "unusable":
    case "unavailable":
      return providerUnavailable();
  }
}
