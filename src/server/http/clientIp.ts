import "server-only";

const MAX_KEY_LENGTH = 64;

function proxyHeadersAreTrusted(): boolean {
  const flag = process.env.TRUST_PROXY_HEADERS?.trim().toLowerCase();

  return flag === "1" || flag === "true";
}

function firstForwardedEntry(header: string): string {
  const [first] = header.split(",");

  return first?.trim() ?? "";
}

export function readClientIp(request: Request): string | null {
  if (!proxyHeadersAreTrusted()) {
    return null;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded
    ? firstForwardedEntry(forwarded)
    : (request.headers.get("x-real-ip") ?? "");
  const trimmed = candidate.trim();

  return trimmed === "" ? null : trimmed.slice(0, MAX_KEY_LENGTH);
}
