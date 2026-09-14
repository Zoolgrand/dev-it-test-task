"use client";

import type { ReactElement } from "react";
import { Bold, Italic, Link2, List } from "lucide-react";
import { DemoAction } from "@/components/demoAction";
import { editorMessages } from "@/content/messages/editor";

const tools = [
  { label: editorMessages.formatBold, Icon: Bold },
  { label: editorMessages.formatItalic, Icon: Italic },
  { label: editorMessages.formatList, Icon: List },
];

const toolClassName =
  "flex size-7 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface";

export function DescriptionToolbar(): ReactElement {
  return (
    <div className="flex items-center gap-1 rounded-t-lg bg-surface-container-low px-2 py-1.5">
      {tools.map(({ label, Icon }) => (
        <DemoAction
          key={label}
          message={editorMessages.formattingUnavailable}
          label={label}
          title={label}
          className={toolClassName}
        >
          <Icon className="size-4" aria-hidden />
        </DemoAction>
      ))}
      <div className="mx-1 h-3 w-px bg-outline-variant/50" />
      <DemoAction
        message={editorMessages.formattingUnavailable}
        label={editorMessages.formatLink}
        title={editorMessages.formatLink}
        className={toolClassName}
      >
        <Link2 className="size-4" aria-hidden />
      </DemoAction>
      <span className="ml-auto text-label-sm text-outline">{editorMessages.markdownNote}</span>
    </div>
  );
}
