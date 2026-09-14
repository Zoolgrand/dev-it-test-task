const formatter = new Intl.RelativeTimeFormat("uk", { numeric: "auto", style: "short" });

const units = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
] as const;

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatRelativeTime(isoDate: string, now: Date = new Date()): string {
  const elapsed = new Date(isoDate).getTime() - now.getTime();

  for (const [unit, milliseconds] of units) {
    if (Math.abs(elapsed) >= milliseconds) {
      return capitalise(formatter.format(Math.round(elapsed / milliseconds), unit));
    }
  }

  return capitalise(formatter.format(0, "second"));
}
