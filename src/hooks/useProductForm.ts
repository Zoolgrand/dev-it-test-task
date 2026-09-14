"use client";

import { useState } from "react";
import type { AdminProduct } from "@/domain/product/dto";
import type { FieldErrors } from "@/domain/errors";
import type { ProductStatus } from "@/domain/product/status";
import type { Suggestion } from "@/domain/product/suggestion";

export type ProductFormState = {
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: ProductStatus;
};

export type ProductForm = {
  form: ProductFormState;
  dirty: boolean;
  fieldErrors: FieldErrors;
  expectedUpdatedAt: string;
  justSaved: boolean;
  update: (patch: Partial<ProductFormState>) => void;
  applySuggestion: (suggestion: Suggestion) => void;
  reset: () => void;
  setFieldErrors: (errors: FieldErrors) => void;
  acceptSaved: (product: AdminProduct) => void;
};

function toFormState(product: AdminProduct): ProductFormState {
  return {
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    status: product.status,
  };
}

function isDirty(form: ProductFormState, initial: ProductFormState): boolean {
  return (
    form.description !== initial.description ||
    form.seoTitle !== initial.seoTitle ||
    form.seoDescription !== initial.seoDescription ||
    form.status !== initial.status
  );
}

export function useProductForm(product: AdminProduct): ProductForm {
  const [initial, setInitial] = useState<ProductFormState>(() => toFormState(product));
  const [form, setForm] = useState<ProductFormState>(() => toFormState(product));
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(product.updatedAt);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [justSaved, setJustSaved] = useState(false);

  function update(patch: Partial<ProductFormState>): void {
    setJustSaved(false);
    setForm((previous) => ({ ...previous, ...patch }));
  }

  return {
    form,
    dirty: isDirty(form, initial),
    fieldErrors,
    expectedUpdatedAt,
    justSaved,
    update,
    setFieldErrors,
    applySuggestion(suggestion: Suggestion): void {
      update(suggestion);
      setFieldErrors({});
    },
    reset(): void {
      setForm(initial);
      setJustSaved(false);
      setFieldErrors({});
    },
    acceptSaved(saved: AdminProduct): void {
      setInitial(toFormState(saved));
      setForm(toFormState(saved));
      setExpectedUpdatedAt(saved.updatedAt);
      setFieldErrors({});
      setJustSaved(true);
    },
  };
}
