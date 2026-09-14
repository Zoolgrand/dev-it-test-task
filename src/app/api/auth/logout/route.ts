import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/domain/auth/cookie";
import { logout } from "@/server/auth/service";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await logout(token);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);

  return new Response(null, { status: 204 });
}
