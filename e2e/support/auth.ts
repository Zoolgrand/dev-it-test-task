export const SESSION_COOKIE_NAME = "pcs_session";

export function readSessionCookie(setCookieHeader: string | undefined): string {
  if (!setCookieHeader) {
    throw new Error("Response did not set a session cookie");
  }

  const match = new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`).exec(setCookieHeader);

  if (!match) {
    throw new Error("Set-Cookie header did not contain the session cookie");
  }

  return match[1];
}
