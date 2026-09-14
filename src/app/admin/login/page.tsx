import type { ReactElement } from "react";
import type { Metadata } from "next";
import { LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { messages } from "@/lib/messages";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: messages.login.heading,
};

export default function LoginPage(): ReactElement {
  return (
    <main className="flex w-full flex-1 flex-col items-center bg-surface px-margin-mobile">
      <div className="flex w-full flex-col items-center py-space-xl md:py-[10vh]">
        <Card className="relative w-full max-w-[400px] gap-0 overflow-hidden p-6 shadow-md sm:p-8">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-primary-container to-tertiary" />
          <div className="mt-2 mb-6 flex flex-col items-center text-center">
            <div className="relative mb-4 flex size-12 items-center justify-center rounded-xl bg-surface-container text-primary shadow-sm">
              <LayoutGrid className="size-6" aria-hidden />
              <div className="absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-tertiary ring-2 ring-surface-container-lowest">
                <span className="size-1.5 rounded-full bg-on-tertiary" />
              </div>
            </div>
            <span className="mb-1 text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
              {messages.brand.name}
            </span>
            <h1 className="text-headline-md text-on-surface">{messages.login.heading}</h1>
            <p className="mt-1.5 max-w-[280px] text-body-sm text-on-surface-variant">
              {messages.login.subtitle}
            </p>
          </div>
          <LoginForm />
          <div className="mt-6 flex items-center justify-between border-t border-surface-container-highest pt-4 text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-2 animate-pulse rounded-full bg-tertiary" />
              <span className="text-body-sm">{messages.login.servicesOperational}</span>
            </div>
            <span className="font-mono text-code-sm">{messages.brand.version}</span>
          </div>
        </Card>
      </div>
    </main>
  );
}
