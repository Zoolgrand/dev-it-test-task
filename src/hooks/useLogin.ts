"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/domain/auth/schema";
import type { FieldErrors } from "@/domain/errors";
import { firstFieldErrors } from "@/domain/fieldErrors";
import { loginMessages } from "@/content/messages/login";

export type LoginForm = {
  email: string;
  password: string;
  error: string | null;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function useLogin(redirectTo: string): LoginForm {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      setError(null);
      setFieldErrors(firstFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (response.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      setError(
        response.status === 429 ? loginMessages.rateLimited : loginMessages.invalidCredentials,
      );
    } catch {
      setError(loginMessages.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    password,
    error,
    fieldErrors,
    isSubmitting,
    setEmail,
    setPassword,
    submit,
  };
}
