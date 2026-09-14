import type { ReactElement } from "react";
import { Globe } from "lucide-react";

export function SeoSnippetPreview({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description: string;
}): ReactElement {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3.5">
      <div className="flex items-center gap-1.5 text-code-sm leading-none text-on-surface-variant">
        <Globe className="size-3.5 text-primary" aria-hidden />
        <span className="truncate font-mono">/products/{slug}</span>
      </div>
      <div className="text-serp-link truncate text-body-lg leading-snug font-medium">{title}</div>
      <div className="line-clamp-2 text-body-sm leading-relaxed text-on-surface-variant">
        {description}
      </div>
    </div>
  );
}
