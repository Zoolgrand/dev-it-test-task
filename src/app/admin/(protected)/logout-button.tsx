"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";

export function LogoutButton(): ReactElement {
  const router = useRouter();

  async function handleClick(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <LogOut className="size-[18px]" aria-hidden />
      {messages.nav.logout}
    </Button>
  );
}
