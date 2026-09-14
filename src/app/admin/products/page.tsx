import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/require-admin";
import { messages } from "@/lib/messages";
import { LogoutButton } from "./logout-button";

export default async function AdminProductsPage(): Promise<ReactElement> {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{messages.adminList.heading}</h1>
        <LogoutButton />
      </div>
    </main>
  );
}
