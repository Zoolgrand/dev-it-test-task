import type { NextRequest } from "next/server";
import type { AdminProductListResponse } from "@/domain/api/contracts";
import { DEFAULT_PAGE_SIZE, paginationSchema } from "@/domain/api/pagination";
import { firstFieldErrors } from "@/domain/fieldErrors";
import { requireAdmin } from "@/server/auth/requireAdmin";
import { unauthorized, validationFailed } from "@/server/http/responses";
import { listAdminProducts } from "@/server/products/service";

export async function GET(request: NextRequest): Promise<Response> {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  const params = request.nextUrl.searchParams;
  const parsed = paginationSchema.safeParse({
    limit: params.get("limit") ?? undefined,
    offset: params.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return validationFailed(firstFieldErrors(parsed.error));
  }

  const limit = parsed.data.limit ?? DEFAULT_PAGE_SIZE;
  const offset = parsed.data.offset ?? 0;
  const page = await listAdminProducts({ take: limit, skip: offset });
  const body: AdminProductListResponse = {
    products: page.items,
    total: page.total,
    limit,
    offset,
  };

  return Response.json(body);
}
