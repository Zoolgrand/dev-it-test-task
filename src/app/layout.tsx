import type { Metadata } from "next";
import type { ReactElement } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Content Studio",
  description: "Редактор товарних карток для інтернет-магазину",
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactElement {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
