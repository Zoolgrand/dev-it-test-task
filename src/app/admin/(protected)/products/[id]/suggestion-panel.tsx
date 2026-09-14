"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import type { Suggestion } from "@/domain/product/suggestion";
import type { SuggestionAvailability } from "@/server/llm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";

type SuggestionState =
  { status: "idle" } | { status: "loading" } | { status: "ready"; suggestion: Suggestion };

type SuggestionResponse = { suggestion: Suggestion; mode: "live" | "mock" };

const unavailableReasonMessages: Record<
  Extract<SuggestionAvailability, { status: "unavailable" }>["reason"],
  string
> = {
  missing_api_key: messages.suggestion.unavailableMissingApiKey,
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function SuggestionPanel({
  productId,
  availability,
  dirty,
  onApply,
}: {
  productId: string;
  availability: SuggestionAvailability;
  dirty: boolean;
  onApply: (suggestion: Suggestion) => void;
}): ReactElement {
  const [state, setState] = useState<SuggestionState>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (): Promise<void> => {
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
          response.status === 429 ? messages.suggestion.rateLimited : messages.suggestion.error,
        );
        return;
      }

      const body: SuggestionResponse = await response.json();
      setState({ status: "ready", suggestion: body.suggestion });
    } catch (error) {
      setState({ status: "idle" });
      if (!isAbortError(error)) {
        toast.error(messages.suggestion.error);
      }
    } finally {
      controllerRef.current = null;
    }
  }, [productId]);

  function cancel(): void {
    controllerRef.current?.abort();
  }

  function dismiss(): void {
    setState({ status: "idle" });
  }

  function apply(): void {
    if (state.status !== "ready") return;
    if (dirty && !window.confirm(messages.suggestion.confirmOverwrite)) return;

    onApply(state.suggestion);
    setState({ status: "idle" });
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">{messages.suggestion.heading}</h2>
        {availability.status === "available" && availability.mode === "mock" ? (
          <Badge variant="secondary">{messages.suggestion.demoBadge}</Badge>
        ) : null}
      </div>

      {availability.status === "unavailable" && (
        <div className="flex flex-col gap-1">
          <Button type="button" variant="outline" disabled className="self-start">
            {messages.suggestion.generate}
          </Button>
          <p className="text-sm text-muted-foreground">
            {unavailableReasonMessages[availability.reason]}
          </p>
        </div>
      )}

      {availability.status === "available" && state.status === "idle" && (
        <Button type="button" variant="outline" onClick={generate} className="self-start">
          {messages.suggestion.generate}
        </Button>
      )}

      {state.status === "loading" && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{messages.suggestion.loading}</p>
          <Button type="button" variant="ghost" onClick={cancel}>
            {messages.suggestion.cancel}
          </Button>
        </div>
      )}

      {state.status === "ready" && (
        <div className="flex flex-col gap-3">
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="font-medium">{messages.editor.description}</dt>
              <dd className="whitespace-pre-wrap text-muted-foreground">
                {state.suggestion.description}
              </dd>
            </div>
            <div>
              <dt className="font-medium">{messages.editor.seoTitle}</dt>
              <dd className="text-muted-foreground">{state.suggestion.seoTitle}</dd>
            </div>
            <div>
              <dt className="font-medium">{messages.editor.seoDescription}</dt>
              <dd className="text-muted-foreground">{state.suggestion.seoDescription}</dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <Button type="button" onClick={apply}>
              {messages.suggestion.apply}
            </Button>
            <Button type="button" variant="outline" onClick={dismiss}>
              {messages.suggestion.dismiss}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
