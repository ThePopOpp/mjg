"use client";

// A small rich-text field with a formatting toolbar, a dictation mic and a live
// preview.
//
// It writes the SAME Markdown subset the Editor's own rich-text block fields
// use (**bold**, *italic*, [links](/page), - bullets), rather than HTML. That
// keeps one content grammar across the whole module: anything Mike writes here
// can be handed straight to Steward, or dropped into a page block, without a
// conversion step or a sanitiser to get wrong.

import * as React from "react";
import { Bold, Eye, EyeOff, Italic, Link2, List, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { mdToHtml } from "@/lib/cms/md";
import { useDictation } from "./dictation";

type Wrap = { before: string; after: string; placeholder: string };

const BOLD: Wrap = { before: "**", after: "**", placeholder: "bold text" };
const ITALIC: Wrap = { before: "*", after: "*", placeholder: "italic text" };
const LINK: Wrap = { before: "[", after: "](/page-address)", placeholder: "link text" };

export function RichTextInput({
  value,
  onChange,
  placeholder,
  rows = 8,
  label,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  // Dictated phrases append to the end, so speaking never overwrites typing.
  const appendPhrase = React.useCallback(
    (phrase: string) => {
      if (!phrase) return;
      onChange(value ? `${value.replace(/\s+$/, "")} ${phrase}` : phrase);
    },
    [value, onChange],
  );
  const dictation = useDictation(appendPhrase);

  function surround({ before, after, placeholder: ph }: Wrap) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || ph;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    // Put the caret around the inserted text so typing replaces the placeholder.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function bulletList() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const next = `${value.slice(0, lineStart)}- ${value.slice(lineStart)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 2, start + 2);
    });
  }

  const toolButton = "rounded p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground";

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/50 px-1.5 py-1">
          <button type="button" onClick={() => surround(BOLD)} className={toolButton} title="Bold" aria-label="Bold"><Bold className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => surround(ITALIC)} className={toolButton} title="Italic" aria-label="Italic"><Italic className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={bulletList} className={toolButton} title="Bullet list" aria-label="Bullet list"><List className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => surround(LINK)} className={toolButton} title="Link" aria-label="Link"><Link2 className="h-3.5 w-3.5" /></button>

          <span className="mx-1 h-4 w-px bg-border" aria-hidden />

          {dictation.supported ? (
            <button
              type="button"
              onClick={dictation.toggle}
              aria-pressed={dictation.listening}
              title={dictation.listening ? "Stop dictating" : "Dictate with your voice"}
              className={cn(
                "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
                dictation.listening
                  ? "bg-destructive/15 text-destructive"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              {dictation.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {dictation.listening ? (
                <>
                  Listening
                  <span className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" aria-hidden />
                </>
              ) : (
                "Dictate"
              )}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className={cn(toolButton, "ml-auto flex items-center gap-1 px-2 text-xs font-medium")}
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Editing" : "Preview"}
          </button>
        </div>

        {showPreview ? (
          <div
            className="min-h-[8rem] space-y-3 bg-background p-3 text-sm leading-7 [&_a]:text-[#b88a4a] [&_a]:underline [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: mdToHtml(value) || "<p class='text-muted-foreground'>Nothing written yet.</p>" }}
          />
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={value}
              rows={rows}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full resize-y bg-background px-3 py-2.5 text-sm leading-6 outline-none"
            />
            {dictation.listening && dictation.interim ? (
              <p className="border-t border-dashed border-border px-3 py-1.5 text-sm italic text-muted-foreground">
                {dictation.interim}…
              </p>
            ) : null}
          </>
        )}
      </div>

      {dictation.error ? <p className="mt-1 text-xs text-destructive">{dictation.error}</p> : null}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
