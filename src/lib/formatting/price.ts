const priceFormatter = new Intl.NumberFormat("uk-UA");

export function formatPrice(amount: number): string {
  return `${priceFormatter.format(amount)} ₴`;
}
