"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  Languages,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/lib/messages";

const fieldClassName =
  "bg-surface-container-lowest py-2.5 shadow-sm inset-ring-1 inset-ring-surface-dim focus:bg-surface-bright focus:ring-0 focus:inset-ring-2 focus:inset-ring-primary";

export function LoginForm(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      router.push("/admin/products");
      router.refresh();
      return;
    }

    setError(
      response.status === 429 ? messages.login.rateLimited : messages.login.invalidCredentials,
    );
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">{messages.login.email}</Label>
          <span className="font-mono text-code-sm text-on-surface-variant opacity-75">
            {messages.login.languageHint}
          </span>
        </div>
        <div className="relative flex items-center">
          <AtSign
            className="pointer-events-none absolute left-3 size-[18px] text-on-surface-variant"
            aria-hidden
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder={messages.login.emailPlaceholder}
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={error ? "login-error" : undefined}
            className={`${fieldClassName} pr-3.5 pl-10 disabled:opacity-75`}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{messages.login.password}</Label>
          <button
            type="button"
            onClick={() => toast.info(messages.login.forgotPasswordHint)}
            className="text-body-sm text-on-surface-variant transition-colors hover:text-primary focus:underline focus:outline-none"
          >
            {messages.login.forgotPassword}
          </button>
        </div>
        <div className="relative flex items-center">
          <Lock
            className="pointer-events-none absolute left-3 size-[18px] text-on-surface-variant"
            aria-hidden
          />
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder={messages.login.passwordPlaceholder}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={error ? "login-error" : undefined}
            className={`${fieldClassName} pr-10 pl-10 disabled:opacity-75`}
          />
          <button
            type="button"
            aria-label={
              isPasswordVisible ? messages.login.hidePassword : messages.login.showPassword
            }
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute right-2.5 rounded-md p-1 text-on-surface-variant transition-colors hover:text-on-surface focus:outline-none"
          >
            {isPasswordVisible ? (
              <EyeOff className="size-[18px]" aria-hidden />
            ) : (
              <Eye className="size-[18px]" aria-hidden />
            )}
          </button>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2">
        <Languages className="size-[18px] shrink-0 text-tertiary" aria-hidden />
        <div className="flex flex-col text-left">
          <span className="text-label-sm text-on-surface">{messages.login.engineTitle}</span>
          <span className="text-body-sm text-on-surface-variant">{messages.login.engineNote}</span>
        </div>
      </div>
      {error ? (
        <div
          id="login-error"
          role="alert"
          className="mt-1 flex items-center gap-2.5 rounded-lg bg-error-container p-3 text-body-sm font-medium text-on-error-container"
        >
          <AlertCircle className="size-[18px] shrink-0 text-error" aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="mt-2 w-full disabled:opacity-75"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        <span>{isSubmitting ? messages.login.submitting : messages.login.submit}</span>
        {isSubmitting ? null : <ArrowRight className="size-[18px]" aria-hidden />}
      </Button>
    </form>
  );
}
