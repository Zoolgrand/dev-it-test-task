export type ContentSecurityPolicyOptions = {
  nonce: string | null;
  allowEval: boolean;
};

function scriptSources(options: ContentSecurityPolicyOptions): string[] {
  const sources = ["'self'"];

  if (options.nonce === null) {
    sources.push("'unsafe-inline'");
  } else {
    sources.push(`'nonce-${options.nonce}'`, "'strict-dynamic'");
  }

  if (options.allowEval) {
    sources.push("'unsafe-eval'");
  }

  return sources;
}

export function buildContentSecurityPolicy(options: ContentSecurityPolicyOptions): string {
  return [
    "default-src 'self'",
    `script-src ${scriptSources(options).join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; ");
}
