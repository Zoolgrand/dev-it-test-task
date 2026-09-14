"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { z } from "zod";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/lib/messages";
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
  const dirty = isDirty(form, initial);

  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function handleApplySuggestion(suggestion: Suggestion): void {
    setForm((previous) => ({ ...previous, ...suggestion }));
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
        toast.error(messages.editor.saveFailed);
        return;
      }

      const body: { product: AdminProduct } = await response.json();
      setInitial(toFormState(body.product));
      setForm(toFormState(body.product));
      setExpectedUpdatedAt(body.product.updatedAt);
      toast.success(messages.editor.saved);
    } catch {
      toast.error(messages.editor.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <SuggestionPanel
        productId={product.id}
        availability={suggestionAvailability}
        dirty={dirty}
        onApply={handleApplySuggestion}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{messages.editor.description}</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, description: event.target.value }))
          }
          rows={6}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
        />
        <div className="flex items-center justify-between gap-2">
          {fieldErrors.description ? (
            <p id="description-error" className="text-sm text-destructive">
              {fieldErrors.description}
            </p>
          ) : (
            <span />
          )}
          <CharacterCounter value={form.description} max={DESCRIPTION_MAX_LENGTH} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="seoTitle">{messages.editor.seoTitle}</Label>
        <Textarea
          id="seoTitle"
          value={form.seoTitle}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, seoTitle: event.target.value }))
          }
          rows={2}
          aria-invalid={Boolean(fieldErrors.seoTitle)}
          aria-describedby={fieldErrors.seoTitle ? "seo-title-error" : undefined}
        />
        <div className="flex items-center justify-between gap-2">
          {fieldErrors.seoTitle ? (
            <p id="seo-title-error" className="text-sm text-destructive">
              {fieldErrors.seoTitle}
            </p>
          ) : (
            <span />
          )}
          <CharacterCounter value={form.seoTitle} max={SEO_TITLE_MAX_LENGTH} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="seoDescription">{messages.editor.seoDescription}</Label>
        <Textarea
          id="seoDescription"
          value={form.seoDescription}
          onChange={(event) =>
            setForm((previous) => ({ ...previous, seoDescription: event.target.value }))
          }
          rows={3}
          aria-invalid={Boolean(fieldErrors.seoDescription)}
          aria-describedby={fieldErrors.seoDescription ? "seo-description-error" : undefined}
        />
        <div className="flex items-center justify-between gap-2">
          {fieldErrors.seoDescription ? (
            <p id="seo-description-error" className="text-sm text-destructive">
              {fieldErrors.seoDescription}
            </p>
          ) : (
            <span />
          )}
          <CharacterCounter value={form.seoDescription} max={SEO_DESCRIPTION_MAX_LENGTH} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">{messages.editor.status}</Label>
        <Select
          value={form.status}
          onValueChange={(value) =>
            setForm((previous) => ({ ...previous, status: value as ProductStatus }))
          }
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {messages.status[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={!dirty || isSaving} className="self-start">
        {messages.editor.save}
      </Button>
    </form>
  );
}
