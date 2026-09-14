import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/domain/auth/cookie";
import { findAdminBySession } from "./session";
import type { AdminUser } from "./session";

export type { AdminUser };

export const requireAdmin = cache(async (): Promise<AdminUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return findAdminBySession(token);
});
