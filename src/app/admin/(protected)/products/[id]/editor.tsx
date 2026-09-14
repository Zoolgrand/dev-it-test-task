"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, Check, Globe, Lock, Save, Telescope } from "lucide-react";
import type { FieldErrors } from "@/domain/errors";
import {
  DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/domain/product/limits";
import { productContentSchema } from "@/domain/product/schema";
import { PRODUCT_STATUSES } from "@/domain/product/status";
import type { ProductStatus } from "@/domain/product/status";
import type { Suggestion } from "@/domain/product/suggestion";
import type { SuggestionAvailability } from "@/server/llm";
import type { AdminProduct } from "@/server/products/mappers";
import { Button } from "@/components/ui/button";
import { CharacterCounter } from "@/components/character-counter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/messages";
import { DescriptionToolbar } from "./editor-controls";
import { SuggestionPanel } from "./suggestion-panel";

type FormState = {
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: ProductStatus;
};

function toFormState(product: AdminProduct): FormState {
  return {
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    status: product.status,
  };
}

function toFieldErrors(error: z.ZodError): FieldErrors {
  const flattened = z.flattenError(error).fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened).map(([field, fieldMessages]) => [
      field,
      (fieldMessages as string[])[0] ?? "",
    ]),
  );
}

function isDirty(form: FormState, initial: FormState): boolean {
  return (
    form.description !== initial.description ||
    form.seoTitle !== initial.seoTitle ||
    form.seoDescription !== initial.seoDescription ||
    form.status !== initial.status
  );
}

function FieldError({ id, message }: { id: string; message: string }): ReactElement {
  return (
    <p id={id} className="flex items-center gap-1 text-body-sm text-error">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

export function ProductEditor({
  product,
  suggestionAvailability,
}: {
  product: AdminProduct;
  suggestionAvailability: SuggestionAvailability;
}): ReactElement {
  const [initial, setInitial] = useState<FormState>(() => toFormState(product));
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(product.updatedAt);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = isDirty(form, initial);
  const showSaved = justSaved && !dirty;

  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function updateForm(patch: Partial<FormState>): void {
    setJustSaved(false);
    setForm((previous) => ({ ...previous, ...patch }));
  }

  function handleApplySuggestion(suggestion: Suggestion): void {
    updateForm(suggestion);
    setFieldErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsed = productContentSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          status: form.status,
          expectedUpdatedAt,
        }),
      });

      if (response.status === 422) {
        const body: { error: { fieldErrors?: FieldErrors } } = await response.json();
        setFieldErrors(body.error.fieldErrors ?? {});
        return;
      }

      if (response.status === 409) {
        toast.error(messages.editor.conflict);
        return;
      }

      if (!response.ok) {
        toast.error(messages.editor.saveFailedTitle, { description: messages.editor.saveFailed });
        return;
      }

      const body: { product: AdminProduct } = await response.json();
      setInitial(toFormState(body.product));
      setForm(toFormState(body.product));
      setExpectedUpdatedAt(body.product.updatedAt);
      setJustSaved(true);
      toast.success(messages.editor.saved);
    } catch {
      toast.error(messages.editor.saveFailedTitle, { description: messages.editor.saveFailed });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12"
    >
      <div className="flex flex-col gap-space-lg lg:col-span-8">
        <div className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="text-label-md text-on-surface">{messages.editor.name}</span>
              <span className="inline-flex items-center gap-1 rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
                <Lock className="size-3" aria-hidden />
                {messages.editor.readOnly}
              </span>
            </div>
            <input
              type="text"
              value={product.name}
              readOnly
              disabled
              tabIndex={-1}
              aria-hidden
              className="w-full cursor-not-allowed rounded-lg bg-surface-container-low px-3 py-2 text-body-md text-on-surface-variant outline-none select-all"
            />
            <p className="text-body-sm text-outline">{messages.editor.nameHint}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-space-sm">
              <Label htmlFor="description">{messages.editor.description}</Label>
              <span className="text-label-sm text-on-surface-variant">
                {messages.editor.descriptionLocale}
              </span>
            </div>
            <div className="relative flex flex-col rounded-lg bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20">
              <DescriptionToolbar />
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => updateForm({ description: event.target.value })}
                rows={8}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? "description-error" : undefined}
                className="resize-y rounded-t-none rounded-b-lg bg-surface-container-lowest focus:bg-surface-container-lowest focus:ring-0"
              />
            </div>
            <div className="flex items-center justify-between gap-space-sm pt-0.5">
              {fieldErrors.description ? (
                <FieldError id="description-error" message={fieldErrors.description} />
              ) : (
                <span className="text-body-sm text-outline">{messages.editor.descriptionHint}</span>
              )}
              <CharacterCounter value={form.description} max={DESCRIPTION_MAX_LENGTH} />
            </div>
          </div>

          <div className="my-1 h-px bg-surface-container-high" />

          <div className="flex items-center gap-2">
            <Telescope className="size-5 text-primary" aria-hidden />
            <h2 className="text-headline-sm text-on-surface">{messages.editor.seoHeading}</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-space-sm">
              <Label htmlFor="seoTitle">{messages.editor.seoTitle}</Label>
              <span className="text-label-sm text-outline">{messages.editor.seoTitleHint}</span>
            </div>
            <Input
              id="seoTitle"
              value={form.seoTitle}
              onChange={(event) => updateForm({ seoTitle: event.target.value })}
              aria-invalid={Boolean(fieldErrors.seoTitle)}
              aria-describedby={fieldErrors.seoTitle ? "seo-title-error" : undefined}
            />
            <div className="flex items-center justify-between gap-space-sm pt-0.5">
              {fieldErrors.seoTitle ? (
                <FieldError id="seo-title-error" message={fieldErrors.seoTitle} />
              ) : (
                <span />
              )}
              <CharacterCounter value={form.seoTitle} max={SEO_TITLE_MAX_LENGTH} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoDescription">{messages.editor.seoDescription}</Label>
            <Textarea
              id="seoDescription"
              value={form.seoDescription}
              onChange={(event) => updateForm({ seoDescription: event.target.value })}
              rows={3}
              aria-invalid={Boolean(fieldErrors.seoDescription)}
              aria-describedby={fieldErrors.seoDescription ? "seo-description-error" : undefined}
              className="resize-none"
            />
            <div className="flex items-center justify-between gap-space-sm pt-0.5">
              {fieldErrors.seoDescription ? (
                <FieldError id="seo-description-error" message={fieldErrors.seoDescription} />
              ) : (
                <span />
              )}
              <CharacterCounter value={form.seoDescription} max={SEO_DESCRIPTION_MAX_LENGTH} />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3.5">
            <div className="flex items-center gap-1.5 text-code-sm leading-none text-on-surface-variant">
              <Globe className="size-3.5 text-primary" aria-hidden />
              <span className="truncate font-mono">/products/{product.slug}</span>
            </div>
            <div className="truncate text-body-lg leading-snug font-medium text-[#1a0dab]">
              {form.seoTitle}
            </div>
            <div className="line-clamp-2 text-body-sm leading-relaxed text-on-surface-variant">
              {form.seoDescription}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-space-md pt-space-xs sm:flex-row sm:items-center">
            <div>
              <span className="block text-label-md text-on-surface">{messages.editor.status}</span>
              <span className="text-body-sm text-outline">{messages.editor.statusHint}</span>
            </div>
            <div
              role="radiogroup"
              aria-label={messages.editor.status}
              className="inline-flex self-start rounded-xl bg-surface-container-high p-1 sm:self-auto"
            >
              {PRODUCT_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={form.status === status}
                  onClick={() => updateForm({ status })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-label-md transition-all",
                    form.status === status
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  {form.status === status ? (
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        status === "published" ? "bg-tertiary" : "bg-warning",
                      )}
                    />
                  ) : null}
                  {messages.status[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed right-0 bottom-0 left-0 z-40 bg-surface-bright/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl pb-safe lg:static lg:z-auto lg:bg-transparent lg:shadow-none">
          <div className="flex flex-col gap-2 px-margin-mobile py-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-space-md lg:rounded-xl lg:bg-surface-container-lowest lg:p-space-md lg:shadow-sm">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2 text-body-sm">
                <span
                  className={cn("size-2 rounded-full", dirty ? "bg-warning" : "bg-tertiary")}
                  aria-hidden
                />
                <span className={dirty ? "font-medium text-primary" : "text-on-surface-variant"}>
                  {dirty ? messages.editor.dirty : messages.editor.clean}
                </span>
              </div>
              <span className="font-mono text-[11px] text-outline lg:hidden">
                {messages.editor.autosave}
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <Button
                type="button"
                variant="ghost"
                disabled={!dirty || isSaving}
                onClick={() => {
                  setForm(initial);
                  setJustSaved(false);
                  setFieldErrors({});
                }}
                className="min-h-[44px] flex-1 bg-surface-container text-on-surface hover:bg-surface-container-high lg:min-h-0 lg:flex-none lg:bg-transparent"
              >
                {messages.editor.reset}
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={!dirty || isSaving}
                className="min-h-[44px] flex-1 disabled:bg-surface-container-highest disabled:text-outline disabled:shadow-none lg:min-h-0 lg:flex-none"
              >
                {showSaved ? (
                  <Check className="size-[18px]" aria-hidden />
                ) : (
                  <Save className="size-[18px]" aria-hidden />
                )}
                {showSaved ? messages.editor.saved : messages.editor.save}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-space-md lg:col-span-4">
        <SuggestionPanel
          productId={product.id}
          availability={suggestionAvailability}
          dirty={dirty}
          onApply={handleApplySuggestion}
        />

        <section className="flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">{messages.product.attributes}</h2>
            <span className="text-label-sm text-outline">{messages.product.attributesSource}</span>
          </div>
          <dl className="flex flex-col gap-2 text-body-sm">
            {product.attributes.map((attribute) => (
              <div
                key={attribute.id}
                className="flex justify-between gap-space-sm border-b border-surface-container-high/60 py-1 last:border-b-0"
              >
                <dt className="min-w-0 break-words text-on-surface-variant">{attribute.name}</dt>
                <dd className="min-w-0 text-right font-medium break-words text-on-surface">
                  {attribute.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </form>
  );
}
