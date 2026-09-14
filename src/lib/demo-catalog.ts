const highlights = ["Хіт продажів", "Новинка", "Вибір редакції", "Рекомендовано"] as const;

const priceFormatter = new Intl.NumberFormat("uk-UA");

function fingerprint(slug: string): number {
  let result = 7;

  for (let index = 0; index < slug.length; index += 1) {
    result = (result * 31 + slug.charCodeAt(index)) % 100_000;
  }

  return result;
}

export function demoArticle(slug: string): string {
  const digits = 100 + (fingerprint(slug) % 900);
  const letters = slug
    .replace(/[^a-z]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return `${digits}-${letters === "" ? "PC" : letters}`;
}

export function demoPrice(slug: string): number {
  return 299 + (fingerprint(slug) % 540) * 100;
}

export function demoPriceBeforeDiscount(slug: string): number {
  return Math.round(demoPrice(slug) * 1.15);
}

export function formatPrice(amount: number): string {
  return `${priceFormatter.format(amount)} ₴`;
}

export function demoRating(slug: string): number {
  return (40 + (fingerprint(slug) % 10)) / 10;
}

export function demoReviewCount(slug: string): number {
  return 12 + (fingerprint(slug) % 180);
}

export function demoHighlight(slug: string): string {
  return highlights[fingerprint(slug) % highlights.length] ?? highlights[0];
}
