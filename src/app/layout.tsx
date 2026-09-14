import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactElement } from "react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Product Content Studio",
  description: "Редактор товарних карток для інтернет-магазину",
};

export default function RootLayout({ children }: LayoutProps<"/">): ReactElement {
  return (
    <html lang="uk" className={`${inter.variable} ${jetBrainsMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-surface text-on-surface">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
