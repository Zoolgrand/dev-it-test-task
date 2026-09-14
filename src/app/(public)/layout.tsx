import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { messages } from "@/lib/messages";
import { CatalogSearch } from "./catalog-search";
import { AccountLink, FavouritesButton, LanguageToggle, MobileMenu } from "./header-actions";

const footerNavigation = [
  { label: messages.catalog.footerHome, href: "/" },
  { label: messages.catalog.footerCatalog, href: "/" },
];

const footerInformation = [
  messages.catalog.footerContacts,
  messages.catalog.footerHelp,
  messages.catalog.footerTerms,
];

export default function PublicLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <header className="sticky top-0 z-50 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-[24px] px-gutter-mobile md:px-gutter">
          <div className="flex items-center gap-[40px]">
            <Link href="/" className="group flex items-center gap-space-xs">
              <span className="size-2 rounded-full bg-primary transition-transform group-hover:scale-125" />
              <span className="hidden text-headline-sm font-semibold tracking-tight text-on-surface sm:inline">
                {messages.catalog.brand}
              </span>
              <span className="text-headline-sm font-semibold tracking-tight text-on-surface sm:hidden">
                {messages.catalog.brandShort}
              </span>
            </Link>
            <nav className="hidden items-center gap-[24px] md:flex">
              <Link
                href="/"
                className="text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {messages.catalog.navHome}
              </Link>
              <Link
                href="/"
                aria-current="page"
                className="text-label-md font-semibold text-on-surface"
              >
                {messages.catalog.navCatalog}
              </Link>
              <span className="cursor-default text-label-md text-on-surface-variant/70">
                {messages.catalog.navAbout}
              </span>
              <span className="cursor-default text-label-md text-on-surface-variant/70">
                {messages.catalog.navContacts}
              </span>
            </nav>
          </div>
          <div className="hidden items-center gap-[12px] md:flex">
            <CatalogSearch className="w-48 lg:w-64" />
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

      <footer className="mt-space-xl w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full px-gutter-mobile py-space-lg md:hidden">
          <div className="flex flex-col gap-space-md">
            <div className="space-y-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-headline-sm font-semibold text-on-surface">
                  {messages.catalog.footerBrand}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">{messages.catalog.footerAbout}</p>
            </div>
            <div className="grid grid-cols-2 gap-space-md pt-space-xs">
              <div>
                <h4 className="mb-space-xs text-label-sm font-semibold text-on-surface">
                  {messages.catalog.footerNavigation}
                </h4>
                <ul className="space-y-space-xs text-body-sm text-on-surface-variant">
                  <li>
                    <Link href="/" className="transition-colors hover:text-on-surface">
                      {messages.catalog.footerHomeShort}
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="transition-colors hover:text-on-surface">
                      {messages.catalog.footerCatalogShort}
                    </Link>
                  </li>
                  <li className="text-on-surface-variant/70">
                    {messages.catalog.footerAboutShort}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-space-xs text-label-sm font-semibold text-on-surface">
                  {messages.catalog.footerConnection}
                </h4>
                <p className="mb-space-xs text-body-sm text-on-surface-variant">
                  {messages.catalog.footerAddress}
                  <br />
                  {messages.catalog.footerEmail}
                </p>
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-tertiary" />
                  <span className="text-[11px] text-tertiary">
                    {messages.catalog.footerStatusShort}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 border-t border-outline-variant/30 pt-space-md">
              <p className="text-[12px] text-on-surface-variant">{messages.catalog.rightsShort}</p>
              <p className="font-mono text-[11px] text-outline">
                {messages.brand.version} • {messages.catalog.engineMobile}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-7xl px-gutter py-[48px] md:block">
          <div className="grid grid-cols-4 gap-x-[32px] gap-y-[40px]">
            <div className="space-y-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-headline-sm font-semibold text-on-surface">
                  {messages.catalog.footerBrand}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant">{messages.catalog.footerAbout}</p>
            </div>
            <div>
              <h4 className="mb-[12px] text-label-md font-semibold text-on-surface">
                {messages.catalog.footerNavigation}
              </h4>
              <ul className="space-y-[8px] text-body-sm text-on-surface-variant">
                {footerNavigation.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition-colors hover:text-on-surface">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="text-on-surface-variant/70">{messages.catalog.footerAboutLink}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-[12px] text-label-md font-semibold text-on-surface">
                {messages.catalog.footerInformation}
              </h4>
              <ul className="space-y-[8px] text-body-sm text-on-surface-variant/70">
                {footerInformation.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-[12px] text-label-md font-semibold text-on-surface">
                {messages.catalog.footerConnection}
              </h4>
              <p className="mb-[12px] text-body-sm text-on-surface-variant">
                {messages.catalog.footerAddress}
                <br />
                {messages.catalog.footerEmail}
              </p>
              <div className="flex items-center gap-space-xs">
                <span className="size-2 rounded-full bg-tertiary" />
                <span className="text-label-sm text-tertiary">{messages.catalog.footerStatus}</span>
              </div>
            </div>
          </div>
          <div className="mt-[40px] flex items-center justify-between gap-[12px] border-t border-outline-variant/30 pt-[24px]">
            <p className="text-body-sm text-on-surface-variant">{messages.catalog.rights}</p>
            <p className="font-mono text-code-sm text-outline">
              {messages.brand.version} • {messages.catalog.engine}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
