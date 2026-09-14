import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  Languages,
  Package,
  Settings,
  SlidersHorizontal,
  SquarePen,
  User,
} from "lucide-react";
import { messages } from "@/lib/messages";
import { requireAdmin } from "@/server/auth/require-admin";
import { LogoutButton } from "./logout-button";
import { AdminMobileNav } from "./mobile-nav";

const sidebarSections = [
  { label: messages.nav.descriptions, Icon: FileText },
  { label: messages.nav.attributes, Icon: SlidersHorizontal },
  { label: messages.nav.localization, Icon: Languages },
];

const inactiveItemClassName =
  "flex cursor-default items-center gap-space-sm rounded-lg px-space-md py-2 text-label-md text-on-surface-variant/70";

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
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-outline-variant/40 bg-surface-container-lowest">
        <div className="flex h-14 w-full items-center justify-between gap-[24px] px-margin-mobile md:px-space-lg">
          <div className="flex items-center gap-[24px]">
            <div className="hidden size-7 items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-container-high text-primary md:flex">
              <SquarePen className="size-4" aria-hidden />
            </div>
            <div className="flex items-center gap-[10px]">
              <span className="text-headline-sm tracking-tight text-on-surface">
                {messages.brand.name}
              </span>
              <span className="hidden rounded-full border border-outline-variant/40 bg-surface-container-high px-space-xs py-0.5 text-label-sm text-on-surface-variant md:inline">
                {messages.brand.version}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-[16px]">
            <span className="hidden text-body-sm text-on-surface-variant lg:inline">
              {admin.email}
            </span>
            <LogoutButton />
            <span
              title={admin.email}
              className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary"
            >
              <User className="size-[18px]" aria-hidden />
              <span className="sr-only">{messages.nav.account}</span>
            </span>
          </div>
        </div>
      </header>

      <aside className="fixed top-14 bottom-0 left-0 z-40 hidden w-64 flex-col border-r border-outline-variant/40 bg-surface-container-lowest p-space-md lg:flex">
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin/products"
            aria-current="page"
            className="flex items-center gap-space-sm rounded-lg bg-primary px-space-md py-2 text-label-md text-on-primary"
          >
            <Package className="size-[18px]" aria-hidden />
            {messages.nav.catalog}
          </Link>
          {sidebarSections.map(({ label, Icon }) => (
            <span key={label} aria-disabled className={inactiveItemClassName}>
              <Icon className="size-[18px]" aria-hidden />
              {label}
            </span>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/30 pt-space-md">
          <span aria-disabled className={inactiveItemClassName}>
            <Settings className="size-[18px]" aria-hidden />
            {messages.nav.settings}
          </span>
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="min-h-screen w-full bg-background px-margin-mobile pt-14 pb-24 lg:p-margin lg:pt-14 lg:pb-margin">
          <div className="py-space-md lg:py-space-lg">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
