import { Suspense } from "react";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { catalogMessages } from "@/content/messages/catalog";
import { CatalogSearch } from "./_components/catalogSearch";
import { SearchFallback } from "./_components/searchFallback";
import { AccountLink, FavouritesButton, LanguageToggle, MobileMenu } from "./_components/headerNav";
import { SiteFooter } from "./_components/siteFooter";

export default function PublicLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <header className="sticky top-0 z-50 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-[24px] px-gutter-mobile md:px-gutter">
          <div className="flex items-center gap-[40px]">
            <Link href="/" className="group flex items-center gap-space-xs">
              <span className="size-2 rounded-full bg-primary transition-transform group-hover:scale-125" />
              <span className="hidden text-headline-sm font-semibold tracking-tight text-on-surface sm:inline">
                {catalogMessages.brand}
              </span>
              <span className="text-headline-sm font-semibold tracking-tight text-on-surface sm:hidden">
                {catalogMessages.brandShort}
              </span>
            </Link>
            <nav className="hidden items-center gap-[24px] md:flex">
              <Link
                href="/"
                className="text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {catalogMessages.navHome}
              </Link>
              <Link
                href="/"
                aria-current="page"
                className="text-label-md font-semibold text-on-surface"
              >
                {catalogMessages.navCatalog}
              </Link>
              <span className="cursor-default text-label-md text-on-surface-variant/70">
                {catalogMessages.navAbout}
              </span>
              <span className="cursor-default text-label-md text-on-surface-variant/70">
                {catalogMessages.navContacts}
              </span>
            </nav>
          </div>
          <div className="hidden items-center gap-[12px] md:flex">
            <Suspense fallback={<SearchFallback className="w-48 lg:w-64" />}>
              <CatalogSearch className="w-48 lg:w-64" />
            </Suspense>
            <LanguageToggle />
            <FavouritesButton />
            <AccountLink />
          </div>
          <MobileMenu />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-gutter-mobile py-space-lg md:px-gutter md:py-space-xl">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
