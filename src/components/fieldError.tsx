import type { ReactElement } from "react";
import { AlertCircle } from "lucide-react";

export function FieldError({ id, message }: { id: string; message: string }): ReactElement {
  return (
    <p id={id} className="flex items-center gap-1 text-body-sm text-error">
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
