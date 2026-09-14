import { cookies } from "next/headers";
import { logout } from "@/server/auth/service";
import { SESSION_COOKIE_NAME } from "@/server/auth/session";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await logout(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);

  return new Response(null, { status: 204 });
}
