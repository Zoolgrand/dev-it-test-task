export type SearchParamPatch = Record<string, string | null>;

export function buildHref(
  pathname: string,
  current: URLSearchParams,
  patch: SearchParamPatch = {},
): string {
  const next = new URLSearchParams(current);

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  return next.size === 0 ? pathname : `${pathname}?${next.toString()}`;
}
