"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
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
    <Button variant="outline" onClick={handleClick}>
      {messages.nav.logout}
    </Button>
  );
}
