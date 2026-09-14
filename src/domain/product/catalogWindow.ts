export const CATALOG_PAGE_SIZE = 6;
export const CATALOG_MAX_VISIBLE = 60;

export type CatalogWindow = {
  limit: number;
  scan: number;
  nextLimit: number | null;
};

export function resolveCatalogWindow(shown: string, sortedInMemory: boolean): CatalogWindow {
  const requested = Number.parseInt(shown, 10);
  const asked = Number.isFinite(requested) && requested > 0 ? requested : CATALOG_PAGE_SIZE;
  const limit = Math.min(asked, CATALOG_MAX_VISIBLE);
  const next = limit + CATALOG_PAGE_SIZE;

  return {
    limit,
    scan: sortedInMemory ? CATALOG_MAX_VISIBLE : limit,
    nextLimit: next <= CATALOG_MAX_VISIBLE ? next : null,
  };
}
