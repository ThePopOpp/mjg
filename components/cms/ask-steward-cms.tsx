"use client";

import { useRef, useState } from "react";
import { Bot, X, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentChat } from "@/components/ai-agent/agent-chat";

const CMS_SUGGESTIONS = [
  "Build a landing page for the Stewardship Blueprint: a hero, three feature cards, an FAQ, and a closing call-to-action.",
  "Create a resources page with a heading, short intro, and a 3-column card grid of downloads.",
  "Draft an informational page about our mission with a quote and two content sections.",
  "Turn the attached content into a full page with sections and a call-to-action.",
];

const MAX_CHARS = 60000;

// "Steward AI" — opens the agent in a modal to author a full CMS page. Supports a
// text/voice brief plus an uploaded reference file (JSON, CSV, or text/markdown)
// that is attached to the first message. Everything Steward creates is a DRAFT.
export function AskStewardCms({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    onClose?.(); // let the list refresh to pick up any new draft
  }

  async function onFile(file: File) {
    setUploadError(null);
    const name = file.name.toLowerCase();
    const ok = /\.(json|csv|txt|md|markdown)$/.test(name) || file.type.startsWith("text/") || file.type === "application/json";
    if (!ok) {
      if (name.endsWith(".pdf")) { setUploadError("PDF import is coming soon — paste the text or upload JSON/CSV/TXT for now."); return; }
      setUploadError("Unsupported file. Upload JSON, CSV, TXT, or Markdown.");
      return;
    }
    try {
      let text = await file.text();
      if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS) + "\n…(truncated)";
      setContext(text);
      setFileName(file.name);
    } catch {
      setUploadError("Could not read that file.");
    }
  }

  function clearFile() {
    setContext("");
    setFileName(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="shrink-0 gap-1.5">
        <Bot className="h-4 w-4" /> Steward AI
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-2xl">
            <button
              onClick={close}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Attachment bar */}
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <input
                ref={inputRef}
                type="file"
                accept=".json,.csv,.txt,.md,.markdown,text/plain,application/json,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }}
              />
              {fileName ? (
                <>
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{fileName} <span className="text-muted-foreground">({context.length.toLocaleString()} chars attached)</span></span>
                  <button onClick={clearFile} className="ml-auto shrink-0 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </>
              ) : (
                <>
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Optionally attach a page brief — JSON, CSV, TXT, or Markdown.</span>
                  <Button variant="outline" size="sm" className="ml-auto h-7 shrink-0" onClick={() => inputRef.current?.click()}>Upload</Button>
                </>
              )}
            </div>
            {uploadError && <div className="mb-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{uploadError}</div>}

            <AgentChat
              title="Steward AI"
              subtitle="CMS page builder"
              suggestions={CMS_SUGGESTIONS}
              placeholder="Describe the page you want… (Enter to send, mic to speak)"
              audio
              extraContext={context}
              heightClassName="h-[68vh] min-h-[420px]"
              emptyTitle="Let's build a page"
              emptyHint="Describe the page in text or by voice, or upload a brief above. I'll assemble the blocks and save it as a DRAFT for a Super Admin to review and publish."
            />
          </div>
        </div>
      )}
    </>
  );
}
