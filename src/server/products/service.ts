import "server-only";
import { findAllForAdmin, findByIdForAdmin } from "./repository";
import { toAdminProduct, toAdminProductListItem } from "./mappers";
import type { AdminProduct, AdminProductListItem } from "./mappers";

export async function listAdminProducts(): Promise<AdminProductListItem[]> {
  const rows = await findAllForAdmin();

  return rows.map(toAdminProductListItem);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const row = await findByIdForAdmin(id);

  return row ? toAdminProduct(row) : null;
}
