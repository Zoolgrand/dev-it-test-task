"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { navMessages } from "@/content/messages/nav";

export function useLogout(redirectTo: string): {
  isLoggingOut: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout(): Promise<void> {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        toast.error(navMessages.logoutFailed);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error(navMessages.logoutFailed);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return { isLoggingOut, logout };
}
