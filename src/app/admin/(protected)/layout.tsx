import type { ReactElement, ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth/require-admin";
import { LogoutButton } from "./logout-button";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-4">
        <span className="text-sm font-medium text-muted-foreground">{admin.email}</span>
        <LogoutButton />
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
