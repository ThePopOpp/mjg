"use client";

// The property panel (spec §11, right panel). Fields come straight from the
// registry and are split into Content / Design so the two audiences — "what does
// it say" and "how does it sit on the page" — stay separate.

import * as React from "react";
import { cn } from "@/lib/utils";
import { getDefinition } from "@/lib/website/registry";
import type { FieldDef } from "@/lib/website/schema";
import type { WebsiteBlock } from "@/lib/website/types";
import { FieldInput } from "./field-input";

type Tab = "content" | "design";

export function BlockSettings({
  block,
  pageTitle,
  onChange,
}: {
  block: WebsiteBlock;
  pageTitle: string;
  onChange: (props: Record<string, unknown>) => void;
}) {
  const [tab, setTab] = React.useState<Tab>("content");
  const definition = getDefinition(block.type);

  if (!definition) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        This section uses a component that is no longer registered. Remove it, or ask a developer to restore it.
      </div>
    );
  }

  const contentFields = definition.fields.filter((f) => (f.group ?? "content") === "content" || f.group === "media");
  const designFields = definition.fields.filter((f) => f.group === "design" || f.group === "layout");

  const set = (key: string, value: unknown) => onChange({ ...block.props, [key]: value });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section</p>
        <h2 className="mt-0.5 font-semibold">{definition.label}</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{definition.description}</p>
      </div>

      <div className="flex gap-1 border-b border-border px-2 pt-2">
        {(["content", "design"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px rounded-t-md px-3 py-2 text-sm font-medium capitalize",
              tab === t ? "border-b-2 border-[#b88a4a] text-[#b88a4a]" : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "design" ? "Design & layout" : "Content"}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {(tab === "content" ? contentFields : designFields).map((field: FieldDef) => (
          <FieldInput
            key={field.key}
            field={field}
            value={block.props[field.key]}
            onChange={(v) => set(field.key, v)}
            aiContext={
              field.kind === "richtext" || field.kind === "textarea"
                ? { pageTitle, blockLabel: definition.label }
                : undefined
            }
          />
        ))}
        {tab === "design" && !designFields.length ? (
          <p className="text-sm text-muted-foreground">This section has no layout options.</p>
        ) : null}
      </div>
    </div>
  );
}
