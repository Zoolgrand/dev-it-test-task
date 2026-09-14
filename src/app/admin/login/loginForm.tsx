"use client";

import type { ReactElement } from "react";
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
import { DemoAction } from "@/components/demoAction";
import { FieldError } from "@/components/fieldError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginMessages } from "@/content/messages/login";
import { useLogin } from "@/hooks/useLogin";
import { useToggle } from "@/hooks/useToggle";
import { cn } from "@/lib/utils";

const fieldClassName =
  "bg-surface-container-lowest py-2.5 shadow-sm inset-ring-1 inset-ring-surface-dim focus:bg-surface-bright focus:ring-0 focus:inset-ring-2 focus:inset-ring-primary disabled:opacity-75";

export function LoginForm(): ReactElement {
  const { email, password, error, fieldErrors, isSubmitting, setEmail, setPassword, submit } =
    useLogin("/admin/products");
  const { isOn: isPasswordVisible, toggle: togglePassword } = useToggle();

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">{loginMessages.email}</Label>
          <span className="font-mono text-code-sm text-on-surface-variant opacity-75">
            {loginMessages.languageHint}
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
            placeholder={loginMessages.emailPlaceholder}
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : error ? "login-error" : undefined}
            className={cn(fieldClassName, "pr-3.5 pl-10")}
          />
        </div>
        {fieldErrors.email ? <FieldError id="email-error" message={fieldErrors.email} /> : null}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{loginMessages.password}</Label>
          <DemoAction
            message={loginMessages.forgotPasswordHint}
            className="text-body-sm text-on-surface-variant transition-colors hover:text-primary focus:underline focus:outline-none"
          >
            {loginMessages.forgotPassword}
          </DemoAction>
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
            placeholder={loginMessages.passwordPlaceholder}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : error ? "login-error" : undefined
            }
            className={cn(fieldClassName, "pr-10 pl-10")}
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? loginMessages.hidePassword : loginMessages.showPassword}
            onClick={togglePassword}
            className="absolute right-2.5 rounded-md p-1 text-on-surface-variant transition-colors hover:text-on-surface focus:outline-none"
          >
            {isPasswordVisible ? (
              <EyeOff className="size-[18px]" aria-hidden />
            ) : (
              <Eye className="size-[18px]" aria-hidden />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <FieldError id="password-error" message={fieldErrors.password} />
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2">
        <Languages className="size-[18px] shrink-0 text-tertiary" aria-hidden />
        <div className="flex flex-col text-left">
          <span className="text-label-sm text-on-surface">{loginMessages.engineTitle}</span>
          <span className="text-body-sm text-on-surface-variant">{loginMessages.engineNote}</span>
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
        <span>{isSubmitting ? loginMessages.submitting : loginMessages.submit}</span>
        {isSubmitting ? null : <ArrowRight className="size-[18px]" aria-hidden />}
      </Button>
    </form>
  );
}
