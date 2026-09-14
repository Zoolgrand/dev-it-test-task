import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/domain/auth/cookie";
import { buildContentSecurityPolicy } from "@/domain/security/csp";

const POLICY_HEADER = "Content-Security-Policy";
const NONCE_HEADER = "x-nonce";
const NONCE_BYTES = 16;

function createNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTES);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes));
}

function isAdminArea(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function needsSession(pathname: string): boolean {
  return isAdminArea(pathname) && !pathname.startsWith("/admin/login");
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const nonce = isAdminArea(pathname) ? createNonce() : null;
  const policy = buildContentSecurityPolicy({
    nonce,
    allowEval: process.env.NODE_ENV === "development",
  });

  if (needsSession(pathname) && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const redirect = NextResponse.redirect(new URL("/admin/login", request.url));
    redirect.headers.set(POLICY_HEADER, policy);

    return redirect;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(POLICY_HEADER, policy);

  if (nonce !== null) {
    requestHeaders.set(NONCE_HEADER, nonce);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(POLICY_HEADER, policy);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
