import type { ReactElement } from "react";
import Link from "next/link";
import { brandMessages } from "@/content/messages/brand";
import { catalogMessages } from "@/content/messages/catalog";

const navigation = [
  { label: catalogMessages.footerHome, href: "/" },
  { label: catalogMessages.footerCatalog, href: "/" },
];

const information = [
  catalogMessages.footerContacts,
  catalogMessages.footerHelp,
  catalogMessages.footerTerms,
];

const columnHeadingClassName = "mb-space-xs text-label-md font-semibold text-on-surface";

export function SiteFooter(): ReactElement {
  return (
    <footer className="mt-space-xl w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="mx-auto w-full max-w-7xl px-gutter-mobile py-space-lg md:px-gutter md:py-[48px]">
        <div className="grid grid-cols-2 gap-x-space-lg gap-y-space-lg md:grid-cols-4">
          <div className="col-span-2 space-y-space-xs md:col-span-1">
            <div className="flex items-center gap-space-xs">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-headline-sm font-semibold text-on-surface">
                {catalogMessages.footerBrand}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">{catalogMessages.footerAbout}</p>
          </div>

          <div>
            <h2 className={columnHeadingClassName}>{catalogMessages.footerNavigation}</h2>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-on-surface">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="text-on-surface-variant/70">{catalogMessages.footerAboutLink}</li>
            </ul>
          </div>

          <div>
            <h2 className={columnHeadingClassName}>{catalogMessages.footerInformation}</h2>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant/70">
              {information.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={columnHeadingClassName}>{catalogMessages.footerConnection}</h2>
            <p className="mb-space-xs text-body-sm text-on-surface-variant">
              {catalogMessages.footerAddress}
              <br />
              {catalogMessages.footerEmail}
            </p>
            <div className="flex items-center gap-space-xs">
              <span className="size-2 rounded-full bg-tertiary" />
              <span className="text-label-sm text-tertiary">{catalogMessages.footerStatus}</span>
            </div>
          </div>
        </div>

        <div className="mt-space-lg flex flex-col gap-1 border-t border-outline-variant/30 pt-space-md sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-sm text-on-surface-variant">{catalogMessages.rights}</p>
          <p className="font-mono text-code-sm text-outline">
            {brandMessages.version} • {catalogMessages.engine}
          </p>
        </div>
      </div>
    </footer>
  );
}
