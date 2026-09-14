"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Clock,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
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

const scenarios = [
  messages.suggestion.scenarioBenefits,
  messages.suggestion.scenarioSeoLength,
  messages.suggestion.scenarioSpecs,
];

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
  const isDemo = availability.status === "available" && availability.mode === "mock";

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
    <section className="relative flex flex-col gap-space-md overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
      <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-primary-fixed/40 blur-2xl" />

      <div className="relative z-10 flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-headline-sm leading-tight text-on-surface">
              {messages.suggestion.heading}
            </h2>
            <span className="text-body-sm text-on-surface-variant">
              {messages.suggestion.subtitle}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isDemo && state.status !== "ready" ? (
            <Badge variant="outline">{messages.suggestion.demoBadge}</Badge>
          ) : null}
          <Badge className="bg-primary-fixed font-semibold text-on-primary-fixed">
            {messages.suggestion.tier}
          </Badge>
        </div>
      </div>

      <p className="text-body-sm leading-relaxed text-on-surface-variant">
        {messages.suggestion.intro}
      </p>

      {availability.status === "unavailable" ? (
        <div className="flex flex-col gap-2">
          <Button type="button" disabled className="w-full">
            <Sparkles className="size-[18px]" aria-hidden />
            {messages.suggestion.generate}
          </Button>
          <p className="text-body-sm text-on-surface-variant">
            {unavailableReasonMessages[availability.reason]}
          </p>
        </div>
      ) : null}

      {availability.status === "available" && state.status === "idle" ? (
        <Button type="button" size="lg" onClick={generate} className="w-full">
          <Sparkles className="size-[18px]" aria-hidden />
          {messages.suggestion.generate}
        </Button>
      ) : null}

      <div className="flex flex-col gap-2 pt-space-xs">
        <span className="text-label-sm font-semibold tracking-wider text-outline uppercase">
          {messages.suggestion.scenariosHeading}
        </span>
        <div
          className={
            state.status === "loading"
              ? "pointer-events-none flex flex-wrap gap-1.5 opacity-60"
              : "flex flex-wrap gap-1.5"
          }
        >
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              type="button"
              onClick={() => toast.info(messages.suggestion.scenariosUnavailable)}
              className="rounded-lg bg-surface-container-low px-2.5 py-1.5 text-left text-xs leading-snug text-on-surface transition-colors hover:bg-surface-container-high"
            >
              {scenario}
            </button>
          ))}
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="flex w-full flex-col gap-2.5 rounded-lg border border-primary/20 bg-primary/10 p-3">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-2.5">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
              <span className="text-label-md font-medium text-primary">
                {messages.suggestion.loading}
              </span>
            </div>
            <Button type="button" variant="destructive" size="xs" onClick={cancel}>
              <X className="size-4" aria-hidden />
              {messages.suggestion.cancel}
            </Button>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-1.5 w-3/4 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      ) : null}

      {state.status === "loading" ? (
        <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-label-sm font-semibold text-outline">
              <RefreshCw className="size-4 animate-spin" aria-hidden />
              {messages.suggestion.analysing}
            </span>
            <span className="text-label-sm font-medium text-outline">
              {messages.suggestion.waiting}
            </span>
          </div>
          <div className="flex flex-col gap-2 py-1">
            <div className="h-3.5 w-full animate-pulse rounded bg-surface-container-highest" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-surface-container-highest" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-container-highest" />
          </div>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <>
          <div className="flex items-center justify-between gap-space-sm rounded-lg border border-tertiary/20 bg-tertiary-fixed/30 p-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-[18px] text-tertiary" aria-hidden />
              <span className="text-label-md font-medium text-tertiary">
                {messages.suggestion.generatedBanner}
              </span>
            </div>
            <button
              type="button"
              onClick={generate}
              className="inline-flex items-center gap-1 text-label-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              <RefreshCw className="size-4" aria-hidden />
              {messages.suggestion.regenerate}
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="flex items-center gap-1.5 text-label-sm font-semibold text-on-surface">
                <Lightbulb className="size-4 text-primary" aria-hidden />
                {messages.suggestion.generated}
              </span>
              {isDemo ? <Badge variant="outline">{messages.suggestion.demoBadge}</Badge> : null}
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-label-sm tracking-wider text-outline uppercase">
                  {messages.editor.description}
                </span>
                <p className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2.5 text-body-sm leading-relaxed whitespace-pre-wrap text-on-surface">
                  {state.suggestion.description}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm tracking-wider text-outline uppercase">
                  {messages.suggestion.seoGroup}
                </span>
                <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-2.5">
                  <span className="truncate text-body-sm leading-tight font-medium text-[#1a0dab]">
                    {state.suggestion.seoTitle}
                  </span>
                  <span className="text-body-sm leading-snug text-on-surface-variant">
                    {state.suggestion.seoDescription}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="button" onClick={apply} className="flex-1">
                <Check className="size-[18px]" aria-hidden />
                {messages.suggestion.apply}
              </Button>
              <Button type="button" variant="outline" onClick={dismiss}>
                {messages.suggestion.dismiss}
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-between gap-space-sm pt-space-xs text-body-sm text-on-surface-variant">
        {state.status === "ready" ? (
          <span className="flex items-center gap-1.5 font-medium text-tertiary">
            <span className="size-2 rounded-full bg-tertiary" aria-hidden />
            {messages.suggestion.readyStatus}
          </span>
        ) : null}
        {state.status === "loading" ? (
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <span className="size-2 animate-ping rounded-full bg-primary" aria-hidden />
            {messages.suggestion.progressNote}
          </span>
        ) : null}
        {state.status === "idle" ? (
          <span className="flex items-center gap-1 text-outline">
            <Clock className="size-4" aria-hidden />
            {messages.suggestion.lastUpdate}: {messages.suggestion.lastUpdateNever}
          </span>
        ) : null}
        <span
          className={
            state.status === "idle" ? "font-medium text-tertiary" : "text-label-sm text-outline"
          }
        >
          {state.status === "idle" ? messages.suggestion.accuracy : messages.suggestion.model}
        </span>
      </div>
    </section>
  );
}
