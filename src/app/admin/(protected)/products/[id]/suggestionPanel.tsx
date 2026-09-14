"use client";

import type { ReactElement } from "react";
import { Clock, Sparkles } from "lucide-react";
import type { Suggestion, SuggestionAvailability } from "@/domain/product/suggestion";
import { DemoAction } from "@/components/demoAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { suggestionMessages } from "@/content/messages/suggestion";
import { useSuggestion } from "@/hooks/useSuggestion";
import { SuggestionResult } from "./_components/suggestionResult";
import { SuggestionSkeleton } from "./_components/suggestionSkeleton";

const unavailableReasonMessages: Record<
  Extract<SuggestionAvailability, { status: "unavailable" }>["reason"],
  string
> = {
  missing_api_key: suggestionMessages.unavailableMissingApiKey,
};

const scenarios = [
  suggestionMessages.scenarioBenefits,
  suggestionMessages.scenarioSeoLength,
  suggestionMessages.scenarioSpecs,
];

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
  const { state, generate, cancel, dismiss } = useSuggestion(productId);
  const isDemo =
    state.status === "ready"
      ? state.mode === "mock"
      : availability.status === "available" && availability.mode === "mock";

  function apply(): void {
    if (state.status !== "ready") return;
    if (dirty && !window.confirm(suggestionMessages.confirmOverwrite)) return;

    onApply(state.suggestion);
    dismiss();
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
              {suggestionMessages.heading}
            </h2>
            <span className="text-body-sm text-on-surface-variant">
              {suggestionMessages.subtitle}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isDemo && state.status !== "ready" ? (
            <Badge variant="outline">{suggestionMessages.demoBadge}</Badge>
          ) : null}
          <Badge className="bg-primary-fixed font-semibold text-on-primary-fixed">
            {suggestionMessages.tier}
          </Badge>
        </div>
      </div>

      <p className="text-body-sm leading-relaxed text-on-surface-variant">
        {suggestionMessages.intro}
      </p>

      {availability.status === "unavailable" ? (
        <div className="flex flex-col gap-2">
          <Button type="button" disabled className="w-full">
            <Sparkles className="size-[18px]" aria-hidden />
            {suggestionMessages.generate}
          </Button>
          <p className="text-body-sm text-on-surface-variant">
            {unavailableReasonMessages[availability.reason]}
          </p>
        </div>
      ) : null}

      {availability.status === "available" && state.status === "idle" ? (
        <Button type="button" size="lg" onClick={generate} className="w-full">
          <Sparkles className="size-[18px]" aria-hidden />
          {suggestionMessages.generate}
        </Button>
      ) : null}

      <div className="flex flex-col gap-2 pt-space-xs">
        <span className="text-label-sm font-semibold tracking-wider text-outline uppercase">
          {suggestionMessages.scenariosHeading}
        </span>
        <div
          className={
            state.status === "loading"
              ? "pointer-events-none flex flex-wrap gap-1.5 opacity-60"
              : "flex flex-wrap gap-1.5"
          }
        >
          {scenarios.map((scenario) => (
            <DemoAction
              key={scenario}
              message={suggestionMessages.scenariosUnavailable}
              className="rounded-lg bg-surface-container-low px-2.5 py-1.5 text-left text-xs leading-snug text-on-surface transition-colors hover:bg-surface-container-high"
            >
              {scenario}
            </DemoAction>
          ))}
        </div>
      </div>

      {state.status === "loading" ? <SuggestionSkeleton onCancel={cancel} /> : null}

      {state.status === "ready" ? (
        <SuggestionResult
          suggestion={state.suggestion}
          isDemo={isDemo}
          onRegenerate={generate}
          onApply={apply}
          onDismiss={dismiss}
        />
      ) : null}

      <div className="flex items-center justify-between gap-space-sm pt-space-xs text-body-sm text-on-surface-variant">
        {state.status === "ready" ? (
          <span className="flex items-center gap-1.5 font-medium text-tertiary">
            <span className="size-2 rounded-full bg-tertiary" aria-hidden />
            {suggestionMessages.readyStatus}
          </span>
        ) : null}
        {state.status === "loading" ? (
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <span className="size-2 animate-ping rounded-full bg-primary" aria-hidden />
            {suggestionMessages.progressNote}
          </span>
        ) : null}
        {state.status === "idle" ? (
          <span className="flex items-center gap-1 text-outline">
            <Clock className="size-4" aria-hidden />
            {suggestionMessages.lastUpdate}: {suggestionMessages.lastUpdateNever}
          </span>
        ) : null}
        <span
          className={
            state.status === "idle" ? "font-medium text-tertiary" : "text-label-sm text-outline"
          }
        >
          {state.status === "idle" ? suggestionMessages.accuracy : suggestionMessages.model}
        </span>
      </div>
    </section>
  );
}
