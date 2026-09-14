"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SuggestionResponse } from "@/domain/api/contracts";
import type { Suggestion, SuggestionMode } from "@/domain/product/suggestion";
import { suggestionMessages } from "@/content/messages/suggestion";

export type SuggestionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; suggestion: Suggestion; mode: SuggestionMode };

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useSuggestion(productId: string): {
  state: SuggestionState;
  generate: () => Promise<void>;
  cancel: () => void;
  dismiss: () => void;
} {
  const [state, setState] = useState<SuggestionState>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function generate(): Promise<void> {
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "loading" });

    try {
      const response = await fetch(`/api/admin/products/${productId}/suggestion`, {
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        setState({ status: "idle" });
        toast.error(
          response.status === 429 ? suggestionMessages.rateLimited : suggestionMessages.error,
        );
        return;
      }

      const body: SuggestionResponse = await response.json();
      setState({ status: "ready", suggestion: body.suggestion, mode: body.mode });
    } catch (error) {
      setState({ status: "idle" });

      if (!isAbortError(error)) {
        toast.error(suggestionMessages.error);
      }
    } finally {
      controllerRef.current = null;
    }
  }

  return {
    state,
    generate,
    cancel: () => controllerRef.current?.abort(),
    dismiss: () => setState({ status: "idle" }),
  };
}
