"use client";

import type { FormEvent, ReactElement } from "react";
import { Telescope } from "lucide-react";
import type { AdminProduct } from "@/domain/product/dto";
import { firstFieldErrors } from "@/domain/fieldErrors";
import {
  DESCRIPTION_MAX_LENGTH,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/domain/product/limits";
import { productContentSchema } from "@/domain/product/schema";
import type { SuggestionAvailability } from "@/domain/product/suggestion";
import { CharacterCounter } from "@/components/characterCounter";
import { FieldError } from "@/components/fieldError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { editorMessages } from "@/content/messages/editor";
import { useProductForm } from "@/hooks/useProductForm";
import { useProductSave } from "@/hooks/useProductSave";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { AttributesCard } from "./_components/attributesCard";
import { DescriptionToolbar } from "./_components/descriptionToolbar";
import { EditorActionBar } from "./_components/editorActionBar";
import { ReadOnlyNameField } from "./_components/readOnlyNameField";
import { SeoSnippetPreview } from "./_components/seoSnippetPreview";
import { StatusToggle } from "./_components/statusToggle";
import { SuggestionPanel } from "./suggestionPanel";

export function ProductEditor({
  product,
  suggestionAvailability,
}: {
  product: AdminProduct;
  suggestionAvailability: SuggestionAvailability;
}): ReactElement {
  const {
    form,
    dirty,
    fieldErrors,
    expectedUpdatedAt,
    justSaved,
    update,
    applySuggestion,
    reset,
    setFieldErrors,
    acceptSaved,
  } = useProductForm(product);
  const { isSaving, save } = useProductSave(product.id);

  useUnsavedChangesWarning(dirty);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const parsed = productContentSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(firstFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    const result = await save({
      ...parsed.data,
      status: form.status,
      expectedUpdatedAt,
    });

    if (result.status === "invalid") {
      setFieldErrors(result.fieldErrors);
      return;
    }

    if (result.status === "saved") {
      acceptSaved(result.product);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12"
    >
      <div className="flex flex-col gap-space-lg lg:col-span-8">
        <div className="flex flex-col gap-space-lg rounded-xl bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
          <ReadOnlyNameField name={product.name} />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-space-sm">
              <Label htmlFor="description">{editorMessages.description}</Label>
              <span className="text-label-sm text-on-surface-variant">
                {editorMessages.descriptionLocale}
              </span>
            </div>
            <div className="relative flex flex-col rounded-lg bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20">
              <DescriptionToolbar />
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update({ description: event.target.value })}
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
                <span className="text-body-sm text-outline">{editorMessages.descriptionHint}</span>
              )}
              <CharacterCounter value={form.description} max={DESCRIPTION_MAX_LENGTH} />
            </div>
          </div>

          <div className="my-1 h-px bg-surface-container-high" />

          <div className="flex items-center gap-2">
            <Telescope className="size-5 text-primary" aria-hidden />
            <h2 className="text-headline-sm text-on-surface">{editorMessages.seoHeading}</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-space-sm">
              <Label htmlFor="seoTitle">{editorMessages.seoTitle}</Label>
              <span className="text-label-sm text-outline">{editorMessages.seoTitleHint}</span>
            </div>
            <Input
              id="seoTitle"
              value={form.seoTitle}
              onChange={(event) => update({ seoTitle: event.target.value })}
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
            <Label htmlFor="seoDescription">{editorMessages.seoDescription}</Label>
            <Textarea
              id="seoDescription"
              value={form.seoDescription}
              onChange={(event) => update({ seoDescription: event.target.value })}
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

          <SeoSnippetPreview
            slug={product.slug}
            title={form.seoTitle}
            description={form.seoDescription}
          />

          <div className="flex flex-col justify-between gap-space-md pt-space-xs sm:flex-row sm:items-center">
            <div>
              <span className="block text-label-md text-on-surface">{editorMessages.status}</span>
              <span className="text-body-sm text-outline">{editorMessages.statusHint}</span>
            </div>
            <StatusToggle value={form.status} onChange={(status) => update({ status })} />
          </div>
        </div>

        <EditorActionBar
          dirty={dirty}
          isSaving={isSaving}
          showSaved={justSaved && !dirty}
          onReset={reset}
        />
      </div>

      <div className="flex flex-col gap-space-md lg:col-span-4">
        <SuggestionPanel
          productId={product.id}
          availability={suggestionAvailability}
          dirty={dirty}
          onApply={applySuggestion}
        />

        <AttributesCard attributes={product.attributes} />
      </div>
    </form>
  );
}
