"use client";

import type { ReactElement } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navMessages } from "@/content/messages/nav";
import { useLogout } from "@/hooks/useLogout";

export function LogoutButton(): ReactElement {
  const { isLoggingOut, logout } = useLogout("/admin/login");

  return (
    <Button variant="outline" size="sm" disabled={isLoggingOut} onClick={logout}>
      <LogOut className="size-[18px]" aria-hidden />
      {navMessages.logout}
    </Button>
  );
}
