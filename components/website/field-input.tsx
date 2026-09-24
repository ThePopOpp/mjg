"use client";

// Frontend Editor — the property panel's field renderer.
//
// The registry drives this completely: one FieldDef becomes one labelled
// control, and a `list` field becomes an add/remove/reorder repeater of nested
// FieldDefs. Registering a new approved component therefore gives Mike a working
// editor for it with no extra UI work (spec: "additional approved frontend
// components can be registered later without redesigning the editor").

import * as React from "react";
import { ChevronDown, ChevronUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { defaultsFor, type FieldDef } from "@/lib/website/schema";
import { MediaPicker } from "./media-picker";
import { InlineAiActions } from "./inline-ai";

const INPUT =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const TEXTAREA = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type FieldInputProps = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Passed down so rich-text fields can offer Steward's inline rewrites. */
  aiContext?: { pageTitle: string; blockLabel: string };
};

function Label({ field, children }: { field: FieldDef; children?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</span>
      {field.required ? <span className="text-xs text-destructive">*</span> : null}
      {children}
    </div>
  );
}

export function FieldInput({ field, value, onChange, aiContext }: FieldInputProps) {
  switch (field.kind) {
    case "text":
    case "url":
      return (
        <div>
          <Label field={field} />
          <input
            className={INPUT}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.kind === "url" ? "/page-address or https://…" : undefined}
          />
          {field.help ? <p className="mt-1 text-xs text-muted-foreground">{field.help}</p> : null}
        </div>
      );

    case "textarea":
    case "richtext":
      return (
        <div>
          <Label field={field} />
          <textarea
            className={TEXTAREA}
            rows={field.kind === "richtext" ? 8 : 4}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.kind === "richtext" ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Supports <strong>**bold**</strong>, <em>*italic*</em>, [links](/page) and - bullet lists.
            </p>
          ) : null}
          {field.help ? <p className="mt-1 text-xs text-muted-foreground">{field.help}</p> : null}
          {aiContext ? (
            <InlineAiActions
              text={String(value ?? "")}
              onReplace={onChange}
              fieldLabel={field.label}
              pageTitle={aiContext.pageTitle}
              blockLabel={aiContext.blockLabel}
            />
          ) : null}
        </div>
      );

    case "number":
      return (
        <div>
          <Label field={field} />
          <input
            type="number"
            className={INPUT}
            min={field.min}
            max={field.max}
            value={Number(value ?? field.default ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );

    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-2.5 py-1">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-[#b88a4a]"
          />
          <span className="text-sm">{field.label}</span>
          {field.help ? <span className="text-xs text-muted-foreground">{field.help}</span> : null}
        </label>
      );

    case "select":
      return (
        <div>
          <Label field={field} />
          <select className={INPUT} value={String(value ?? field.default ?? "")} onChange={(e) => onChange(e.target.value)}>
            {(field.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );

    case "color":
      return (
        <div>
          <Label field={field} />
          <div className="flex gap-2">
            <input
              type="color"
              value={String(value || "#b88a4a")}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-input bg-background"
            />
            <input className={INPUT} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder="#b88a4a" />
          </div>
        </div>
      );

    case "image":
    case "video":
      return <MediaField field={field} value={value} onChange={onChange} />;

    case "link":
      return <LinkField field={field} value={value} onChange={onChange} />;

    case "list":
      return <ListField field={field} value={value} onChange={onChange} aiContext={aiContext} />;

    default:
      return null;
  }
}

function MediaField({ field, value, onChange }: Omit<FieldInputProps, "aiContext">) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const url = String(value ?? "");
  const isImage = field.kind === "image";

  return (
    <div>
      <Label field={field} />
      <div className="flex gap-2">
        <input
          className={INPUT}
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isImage ? "/media/photo.jpg or https://…" : "YouTube or Vimeo link"}
        />
        {isImage ? (
          <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" onClick={() => setPickerOpen(true)}>
            <ImageIcon className="h-3.5 w-3.5" /> Library
          </Button>
        ) : null}
      </div>
      {isImage && url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 max-h-32 rounded-md border border-border object-contain" />
      ) : null}
      {field.help ? <p className="mt-1 text-xs text-muted-foreground">{field.help}</p> : null}
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={(item) => onChange(item.url)} />
    </div>
  );
}

function LinkField({ field, value, onChange }: Omit<FieldInputProps, "aiContext">) {
  const link = (value ?? {}) as { label?: string; href?: string; newTab?: boolean };
  const set = (patch: Partial<typeof link>) => onChange({ ...link, ...patch });

  return (
    <fieldset className="rounded-lg border border-border p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</legend>
      <div className="space-y-2">
        <input className={INPUT} value={link.label ?? ""} onChange={(e) => set({ label: e.target.value })} placeholder="Button label" />
        <input className={INPUT} value={link.href ?? ""} onChange={(e) => set({ href: e.target.value })} placeholder="/page-address or https://…" />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={link.newTab === true}
            onChange={(e) => set({ newTab: e.target.checked })}
            className="h-4 w-4 rounded border-input accent-[#b88a4a]"
          />
          Open in a new tab
        </label>
      </div>
    </fieldset>
  );
}

function ListField({ field, value, onChange, aiContext }: FieldInputProps) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const subFields = field.fields ?? [];
  const max = field.maxItems ?? 24;

  const replace = (next: Record<string, unknown>[]) => onChange(next);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    replace(next);
    setOpenIndex(to);
  };

  const summaryOf = (item: Record<string, unknown>, i: number) => {
    const first = subFields.map((f) => item[f.key]).find((v) => typeof v === "string" && v.trim());
    const label = typeof first === "string" ? first : `${field.itemLabel ?? "Item"} ${i + 1}`;
    return label.length > 44 ? `${label.slice(0, 44)}…` : label;
  };

  return (
    <div>
      <Label field={field}>
        <span className="ml-auto text-xs font-normal normal-case text-muted-foreground">{items.length}/{max}</span>
      </Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex-1 truncate text-left text-sm font-medium"
              >
                {summaryOf(item, i)}
              </button>
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded p-1 hover:bg-muted disabled:opacity-30">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="rounded p-1 hover:bg-muted disabled:opacity-30">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Remove ${field.itemLabel ?? "item"}`}
                onClick={() => replace(items.filter((_, j) => j !== i))}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {openIndex === i ? (
              <div className="space-y-3 border-t border-border p-3">
                {subFields.map((sub) => (
                  <FieldInput
                    key={sub.key}
                    field={sub}
                    value={item[sub.key]}
                    aiContext={aiContext}
                    onChange={(v) => replace(items.map((it, j) => (j === i ? { ...it, [sub.key]: v } : it)))}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("mt-2 gap-1.5", items.length >= max && "hidden")}
        onClick={() => {
          replace([...items, defaultsFor(subFields)]);
          setOpenIndex(items.length);
        }}
      >
        <Plus className="h-3.5 w-3.5" /> Add {field.itemLabel?.toLowerCase() ?? "item"}
      </Button>
    </div>
  );
}
