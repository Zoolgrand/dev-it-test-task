"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { Heart, Menu, Search, User, X } from "lucide-react";
import { toast } from "sonner";
import { CatalogSearch } from "./catalog-search";
import { messages } from "@/lib/messages";

const mobileLinks = [
  { label: messages.catalog.navHome, href: "/" },
  { label: messages.catalog.navCatalog, href: "/" },
];

export function LanguageToggle(): ReactElement {
  return (
    <div className="flex items-center rounded-xl bg-surface-container-low p-0.5">
      <button
        type="button"
        aria-pressed
        className="rounded-lg bg-surface-container-lowest px-2 py-1 text-label-sm text-on-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      >
        {messages.catalog.languageUa}
      </button>
      <button
        type="button"
        aria-pressed={false}
        onClick={() => toast.info(messages.catalog.languageUnavailable)}
        className="rounded-lg px-2 py-1 text-label-sm text-on-surface-variant transition-colors hover:text-on-surface"
      >
        {messages.catalog.languageEn}
      </button>
    </div>
  );
}

export function FavouritesButton({ className }: { className?: string }): ReactElement {
  return (
    <button
      type="button"
      aria-label={messages.catalog.favourites}
      onClick={() => toast.info(messages.catalog.favouritesUnavailable)}
      className={`flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface ${className ?? ""}`}
    >
      <Heart className="size-5" aria-hidden />
    </button>
  );
}

export function AccountLink(): ReactElement {
  return (
    <Link
      href="/admin/products"
      aria-label={messages.catalog.account}
      className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary"
    >
      <User className="size-[18px]" aria-hidden />
    </Link>
  );
}

export function MobileMenu(): ReactElement {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 md:hidden">
        <button
          type="button"
          aria-label={messages.catalog.search}
          aria-expanded={isSearchOpen}
          onClick={() => setIsSearchOpen((open) => !open)}
          className="flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <Search className="size-5" aria-hidden />
        </button>
        <FavouritesButton />
        <button
          type="button"
          aria-label={messages.catalog.menu}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
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
          <CatalogSearch />
        </div>
      ) : null}
      {isMenuOpen ? (
        <nav className="absolute inset-x-0 top-16 flex flex-col border-b border-outline-variant/40 bg-surface-container-lowest px-margin-mobile py-space-sm md:hidden">
          {mobileLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-2 py-2.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              {link.label}
            </Link>
          ))}
          <span className="cursor-default rounded-lg px-2 py-2.5 text-label-md text-on-surface-variant/70">
            {messages.catalog.navAbout}
          </span>
          <span className="cursor-default rounded-lg px-2 py-2.5 text-label-md text-on-surface-variant/70">
            {messages.catalog.navContacts}
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
