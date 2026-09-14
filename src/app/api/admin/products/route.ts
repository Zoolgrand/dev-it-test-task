import { requireAdmin } from "@/server/auth/require-admin";
import { unauthorized } from "@/server/http/responses";
import { listAdminProducts } from "@/server/products/service";

export async function GET(): Promise<Response> {
  const admin = await requireAdmin();

  if (!admin) {
    return unauthorized();
  }

  return Response.json({ products: await listAdminProducts() });
}
