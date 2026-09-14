import type { ReactElement, ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border px-4 py-4">
        <Link href="/" className="text-sm font-medium">
          Product Content Studio
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
