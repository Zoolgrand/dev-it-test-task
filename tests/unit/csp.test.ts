import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "@/domain/security/csp";

function directive(policy: string, name: string): string {
  const found = policy.split("; ").find((part) => part.startsWith(`${name} `));

  if (!found) {
    throw new Error(`Policy has no ${name} directive: ${policy}`);
  }

  return found;
}

describe("content security policy", () => {
  it("restricts every unlisted resource kind to the site itself", () => {
    const policy = buildContentSecurityPolicy({ nonce: null, allowEval: false });

    expect(directive(policy, "default-src")).toBe("default-src 'self'");
  });

  it("forbids framing and plugins whether or not a nonce is used", () => {
    for (const nonce of [null, "abc123"]) {
      const policy = buildContentSecurityPolicy({ nonce, allowEval: false });

      expect(policy).toContain("frame-ancestors 'none'");
      expect(policy).toContain("object-src 'none'");
    }
  });

  it("admits inline scripts only by nonce once a nonce is issued", () => {
    const policy = buildContentSecurityPolicy({ nonce: "abc123", allowEval: false });

    expect(directive(policy, "script-src")).toContain("'nonce-abc123'");
    expect(directive(policy, "script-src")).not.toContain("'unsafe-inline'");
  });

  it("lets a nonced bootstrap script load the bundles it needs", () => {
    const policy = buildContentSecurityPolicy({ nonce: "abc123", allowEval: false });

    expect(directive(policy, "script-src")).toContain("'strict-dynamic'");
  });

  it("falls back to inline scripts where no nonce can be issued", () => {
    const policy = buildContentSecurityPolicy({ nonce: null, allowEval: false });

    expect(directive(policy, "script-src")).toContain("'unsafe-inline'");
    expect(directive(policy, "script-src")).not.toContain("nonce-");
  });

  it("admits eval only when it is asked for", () => {
    const withEval = buildContentSecurityPolicy({ nonce: "abc123", allowEval: true });
    const withoutEval = buildContentSecurityPolicy({ nonce: "abc123", allowEval: false });

    expect(directive(withEval, "script-src")).toContain("'unsafe-eval'");
    expect(directive(withoutEval, "script-src")).not.toContain("'unsafe-eval'");
  });

  it("keeps the nonce out of every directive that does not need it", () => {
    const policy = buildContentSecurityPolicy({ nonce: "abc123", allowEval: false });

    expect(directive(policy, "style-src")).not.toContain("nonce-");
    expect(directive(policy, "img-src")).not.toContain("nonce-");
  });

  it("separates directives the way the header format requires", () => {
    const policy = buildContentSecurityPolicy({ nonce: null, allowEval: false });

    expect(policy).not.toContain(";;");
    expect(policy).not.toMatch(/\s{2}/);
    expect(policy.endsWith(";")).toBe(false);
  });
});
