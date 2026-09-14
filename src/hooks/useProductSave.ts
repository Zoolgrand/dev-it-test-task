"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AdminProductResponse } from "@/domain/api/contracts";
import type { ApiErrorBody, FieldErrors } from "@/domain/errors";
import type { AdminProduct } from "@/domain/product/dto";
import type { ProductUpdate } from "@/domain/product/schema";
import { editorMessages } from "@/content/messages/editor";

export type SaveResult =
  | { status: "saved"; product: AdminProduct }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "failed" };

export function useProductSave(productId: string): {
  isSaving: boolean;
  save: (input: ProductUpdate) => Promise<SaveResult>;
} {
  const [isSaving, setIsSaving] = useState(false);

  async function save(input: ProductUpdate): Promise<SaveResult> {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.status === 422) {
        const body: ApiErrorBody = await response.json();
        return { status: "invalid", fieldErrors: body.error.fieldErrors ?? {} };
      }

      if (response.status === 409) {
        toast.error(editorMessages.conflict);
        return { status: "failed" };
      }

      if (!response.ok) {
        toast.error(editorMessages.saveFailedTitle, { description: editorMessages.saveFailed });
        return { status: "failed" };
      }

      const body: AdminProductResponse = await response.json();
      toast.success(editorMessages.saved);
      return { status: "saved", product: body.product };
    } catch {
      toast.error(editorMessages.saveFailedTitle, { description: editorMessages.saveFailed });
      return { status: "failed" };
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaving, save };
}
