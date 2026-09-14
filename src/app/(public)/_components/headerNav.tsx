"use client";

import { Suspense } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { Heart, Menu, Search, User, X } from "lucide-react";
import { DemoAction } from "@/components/demoAction";
import { catalogMessages } from "@/content/messages/catalog";
import { useToggle } from "@/hooks/useToggle";
import { cn } from "@/lib/utils";
import { CatalogSearch } from "./catalogSearch";
import { SearchFallback } from "./searchFallback";

const mobileLinks = [
  { label: catalogMessages.navHome, href: "/" },
  { label: catalogMessages.navCatalog, href: "/" },
];

const iconButtonClassName =
  "flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface";

export function LanguageToggle(): ReactElement {
  return (
    <div className="flex items-center rounded-xl bg-surface-container-low p-0.5">
      <button
        type="button"
        aria-pressed
        className="rounded-lg bg-surface-container-lowest px-2 py-1 text-label-sm text-on-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      >
        {catalogMessages.languageUa}
      </button>
      <DemoAction
        message={catalogMessages.languageUnavailable}
        className="rounded-lg px-2 py-1 text-label-sm text-on-surface-variant transition-colors hover:text-on-surface"
      >
        {catalogMessages.languageEn}
      </DemoAction>
    </div>
  );
}

export function FavouritesButton({ className }: { className?: string }): ReactElement {
  return (
    <DemoAction
      message={catalogMessages.favouritesUnavailable}
      label={catalogMessages.favourites}
      className={cn(iconButtonClassName, className)}
    >
      <Heart className="size-5" aria-hidden />
    </DemoAction>
  );
}

export function AccountLink(): ReactElement {
  return (
    <Link
      href="/admin/products"
      aria-label={catalogMessages.account}
      className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary"
    >
      <User className="size-[18px]" aria-hidden />
    </Link>
  );
}

export function MobileMenu(): ReactElement {
  const { isOn: isSearchOpen, toggle: toggleSearch } = useToggle();
  const { isOn: isMenuOpen, toggle: toggleMenu } = useToggle();

  return (
    <>
      <div className="flex items-center gap-1 md:hidden">
        <button
          type="button"
          aria-label={catalogMessages.search}
          aria-expanded={isSearchOpen}
          onClick={toggleSearch}
          className={iconButtonClassName}
        >
          <Search className="size-5" aria-hidden />
        </button>
        <FavouritesButton />
        <button
          type="button"
          aria-label={catalogMessages.menu}
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
          className={iconButtonClassName}
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
        </button>
      </div>
      {isSearchOpen ? (
        <div className="absolute inset-x-0 top-16 border-b border-outline-variant/40 bg-surface-container-lowest px-margin-mobile py-space-sm md:hidden">
          <Suspense fallback={<SearchFallback />}>
            <CatalogSearch />
          </Suspense>
        </div>
      ) : null}
      {isMenuOpen ? (
        <nav className="absolute inset-x-0 top-16 flex flex-col border-b border-outline-variant/40 bg-surface-container-lowest px-margin-mobile py-space-sm md:hidden">
          {mobileLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={toggleMenu}
              className="rounded-lg px-2 py-2.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
          <span className="cursor-default rounded-lg px-2 py-2.5 text-label-md text-on-surface-variant/70">
            {catalogMessages.navAbout}
          </span>
          <span className="cursor-default rounded-lg px-2 py-2.5 text-label-md text-on-surface-variant/70">
            {catalogMessages.navContacts}
          </span>
          <div className="flex items-center justify-between px-2 pt-space-sm">
            <LanguageToggle />
            <AccountLink />
          </div>
        </nav>
      ) : null}
    </>
  );
}
