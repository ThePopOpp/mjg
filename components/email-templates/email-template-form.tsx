"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Columns2,
  Copy,
  Eye,
  Image,
  LayoutTemplate,
  MousePointerClick,
  PanelTop,
  Rows3,
  Save,
  Square,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

const sampleMergeData: Record<string, string> = {
  first_name: "Jeremy",
  last_name: "Waters",
  full_name: "Jeremy Waters",
  email: "jw@michaeljgauthier.com",
  phone: "+14803527598",
  role: "Super Admin",
  status: "active",
  wave: "Wave 0",
  source: "direct_text",
  participant_type: "General participant",
  check_in_status: "completed",
  survey_status: "sent",
  inner_circle_status: "invited",
  site_url: "https://my.michaeljgauthier.com",
  preferences_url: "https://my.michaeljgauthier.com/contact",
  unsubscribe_url: "https://my.michaeljgauthier.com/contact",
};

const categories = [
  { value: "general", label: "General" },
  { value: "new_user_signup", label: "New User Sign-Up" },
  { value: "login", label: "Login / Auth" },
  { value: "participants", label: "Participants" },
  { value: "waves", label: "Waves" },
  { value: "check_in_results", label: "Check-In Results" },
  { value: "surveys", label: "Surveys" },
  { value: "pastor_elder_review", label: "Pastor/Elder Review" },
  { value: "inner_circle", label: "Inner Circle" },
  { value: "email_journey", label: "7-Day Email Journey" },
  { value: "notifications", label: "Notifications" },
];

const mergeFields = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "wave",
  "source",
  "participant_type",
  "check_in_status",
  "survey_status",
  "inner_circle_status",
  "site_url",
  "preferences_url",
  "unsubscribe_url",
];

const builderMarker = "MJG_BUILDER_SCHEMA:";

type BlockType = "header" | "columns" | "heading" | "text" | "button" | "image" | "divider" | "spacer" | "footer";
type Align = "left" | "center" | "right";

type EmailBlock = {
  id: string;
  type: BlockType;
  title?: string;
  text?: string;
  url?: string;
  alt?: string;
  linkUrl?: string;
  align?: Align;
  width?: number;
  height?: number;
  headingLevel?: "h1" | "h2" | "h3";
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  dividerColor?: string;
  columns?: Array<{ blocks: EmailBlock[] }>;
  padTop?: number;
  padBottom?: number;
  padX?: number;
};

type EmailBuilderSchema = {
  version: 1;
  settings: {
    width: number;
    backgroundColor: string;
    contentColor: string;
    textColor: string;
    fontFamily: string;
  };
  blocks: EmailBlock[];
};

export type EmailTemplateEditorValue = {
  id?: string;
  name?: string;
  subject?: string;
  preheader?: string | null;
  category?: string;
  status?: "draft" | "active" | "archived";
  html_body?: string;
  text_body?: string | null;
};

const blockPalette: Array<{ type: BlockType; label: string; description: string; icon: React.ReactNode }> = [
  { type: "header", label: "Header", description: "Logo / brand bar", icon: <PanelTop className="h-4 w-4" /> },
  { type: "columns", label: "Columns", description: "2 column layout", icon: <Columns2 className="h-4 w-4" /> },
  { type: "heading", label: "Heading", description: "H1, H2 or H3 title", icon: <Type className="h-4 w-4" /> },
  { type: "text", label: "Text", description: "Body paragraph", icon: <Rows3 className="h-4 w-4" /> },
  { type: "button", label: "Button", description: "CTA button with link", icon: <MousePointerClick className="h-4 w-4" /> },
  { type: "image", label: "Image", description: "Image with optional link", icon: <Image className="h-4 w-4" /> },
  { type: "divider", label: "Divider", description: "Horizontal rule", icon: <Square className="h-4 w-4" /> },
  { type: "spacer", label: "Spacer", description: "Empty vertical gap", icon: <AlignCenter className="h-4 w-4" /> },
  { type: "footer", label: "Footer", description: "Company info footer", icon: <LayoutTemplate className="h-4 w-4" /> },
];

export function EmailTemplateForm({
  initialTemplate,
  onSaved,
}: {
  initialTemplate?: EmailTemplateEditorValue;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const initialSchema = useMemo(() => extractBuilderSchema(initialTemplate?.html_body), [initialTemplate?.html_body]);
  const [editorMode, setEditorMode] = useState<"visual" | "advanced">(initialSchema ? "visual" : initialTemplate?.html_body ? "advanced" : "visual");
  const [editingId, setEditingId] = useState(initialTemplate?.id);
  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [subject, setSubject] = useState(initialTemplate?.subject ?? "Hi {{first_name}},");
  const [preheader, setPreheader] = useState(initialTemplate?.preheader ?? "");
  const [category, setCategory] = useState(initialTemplate?.category ?? "general");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(initialTemplate?.status ?? "draft");
  const [schema, setSchema] = useState<EmailBuilderSchema>(initialSchema ?? createDefaultSchema());
  const [htmlBody, setHtmlBody] = useState(initialTemplate?.html_body ?? buildHtmlWithSchema(createDefaultSchema(), preheader));
  const [textBody, setTextBody] = useState(initialTemplate?.text_body ?? "Hi {{first_name}},\n\nYour message goes here.\n\n{{site_url}}");
  const [selectedBlockId, setSelectedBlockId] = useState(schema.blocks[0]?.id ?? "");
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatedHtml = useMemo(() => buildHtmlWithSchema(schema, preheader), [schema, preheader]);
  const effectiveHtml = editorMode === "visual" ? generatedHtml : htmlBody;
  const previewHtml = useMemo(() => buildPreviewHtml(renderMergeFields(effectiveHtml)), [effectiveHtml]);
  const renderedSubject = useMemo(() => renderMergeFields(subject), [subject]);
  const selectedBlock = useMemo(() => findBlock(schema.blocks, selectedBlockId), [schema.blocks, selectedBlockId]);

  function updateSchema(updater: (current: EmailBuilderSchema) => EmailBuilderSchema) {
    setSchema((current) => updater(current));
  }

  function updateSelectedBlock(patch: Partial<EmailBlock>) {
    updateSchema((current) => ({ ...current, blocks: updateBlock(current.blocks, selectedBlockId, patch) }));
  }

  function addBlock(type: BlockType, afterId?: string) {
    const block = createBlock(type);
    updateSchema((current) => ({ ...current, blocks: insertBlock(current.blocks, block, afterId) }));
    setSelectedBlockId(block.id);
  }

  function deleteSelectedBlock() {
    if (!selectedBlockId) return;
    updateSchema((current) => {
      const blocks = current.blocks.filter((block) => block.id !== selectedBlockId);
      setSelectedBlockId(blocks[0]?.id ?? "");
      return { ...current, blocks };
    });
  }

  function reorderBlock(targetId: string) {
    if (!draggingBlockId || draggingBlockId === targetId) return;
    updateSchema((current) => ({ ...current, blocks: moveBlock(current.blocks, draggingBlockId, targetId) }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const htmlToSave = editorMode === "visual" ? generatedHtml : htmlBody;
    const response = await fetch("/api/admin/email/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ id: editingId, name, subject, preheader, category, status, htmlBody: htmlToSave, textBody, actionToken }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Template could not be saved.");
      setLoading(false);
      return;
    }

    setEditingId(payload.template?.id ?? editingId);
    setHtmlBody(htmlToSave);
    setMessage(editingId ? "Template updated in Supabase." : "Template saved in Supabase.");
    setLoading(false);
    router.refresh();
    onSaved?.();
  }

  function resetForNewTemplate() {
    const next = createDefaultSchema();
    setEditingId(undefined);
    setName("");
    setSubject("Hi {{first_name}},");
    setPreheader("");
    setCategory("general");
    setStatus("draft");
    setSchema(next);
    setSelectedBlockId(next.blocks[0]?.id ?? "");
    setHtmlBody(buildHtmlWithSchema(next, ""));
    setTextBody("Hi {{first_name}},\n\nYour message goes here.\n\n{{site_url}}");
    setEditorMode("visual");
    setMessage(null);
    setError(null);
  }

  async function copyDynamicField(field: string) {
    await navigator.clipboard.writeText(`{{${field}}}`);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1600);
  }

  function switchToAdvanced() {
    setHtmlBody(generatedHtml);
    setEditorMode("advanced");
  }

  function switchToVisual() {
    const parsed = extractBuilderSchema(htmlBody);
    if (parsed) setSchema(parsed);
    setEditorMode("visual");
  }

  return (
    <form className="space-y-5" onSubmit={save}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px_150px]">
        <label className="space-y-2 text-sm font-medium">
          <span>Template name</span>
          <Input onChange={(event) => setName(event.target.value)} placeholder="Wave 0 welcome email" required value={name} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Subject</span>
          <Input onChange={(event) => setSubject(event.target.value)} required value={subject} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Status</span>
          <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "active" | "archived")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <div className="flex items-end gap-2">
          <Button className="w-full" disabled={loading || !name || !subject || !effectiveHtml} type="submit">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_220px]">
        <label className="space-y-2 text-sm font-medium">
          <span>Preview text</span>
          <Input onChange={(event) => setPreheader(event.target.value)} placeholder="Short preview shown in inbox..." value={preheader} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Category / trigger</span>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <div className="flex items-end gap-2">
          <div className="grid w-full grid-cols-2 rounded-md border bg-background p-1">
            <Button type="button" size="sm" variant={editorMode === "visual" ? "default" : "ghost"} onClick={switchToVisual}>Visual</Button>
            <Button type="button" size="sm" variant={editorMode === "advanced" ? "default" : "ghost"} onClick={switchToAdvanced}>HTML</Button>
          </div>
          <Button type="button" size="icon" variant="outline" onClick={() => setPreviewOpen(true)} aria-label="Preview email">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editingId ? (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3 text-sm">
          <span>Editing existing template.</span>
          <Button type="button" variant="outline" size="sm" onClick={resetForNewTemplate}>Create new instead</Button>
        </div>
      ) : null}

      <div className="rounded-md border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Fields</span>
          {mergeFields.map((field) => {
            const copied = copiedField === field;
            return (
              <Button key={field} size="sm" type="button" variant={copied ? "default" : "outline"} onClick={() => copyDynamicField(field)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : `{{${field}}}`}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border bg-card p-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">Rendered subject</p>
        <p className="mt-1 font-semibold">{renderedSubject}</p>
      </div>

      {editorMode === "visual" ? (
        <div className="grid min-h-[46rem] overflow-hidden rounded-md border bg-background lg:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="border-b bg-card p-3 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Add Block</p>
            <div className="space-y-2">
              {blockPalette.map((block) => (
                <button
                  key={block.type}
                  type="button"
                  draggable
                  className="flex w-full items-center gap-3 rounded-md border bg-background p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                  onClick={() => addBlock(block.type)}
                  onDragStart={(event) => event.dataTransfer.setData("application/mjg-block-type", block.type)}
                >
                  <span className="text-primary">{block.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold">{block.label}</span>
                    <span className="block text-xs text-muted-foreground">{block.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main
            className="overflow-auto bg-muted/60 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const type = event.dataTransfer.getData("application/mjg-block-type") as BlockType;
              if (type) addBlock(type);
            }}
          >
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>{schema.blocks.length} blocks</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>Full Preview</Button>
            </div>
            <div className="mx-auto overflow-hidden rounded-md bg-white shadow-sm" style={{ maxWidth: schema.settings.width }}>
              {schema.blocks.length ? (
                schema.blocks.map((block) => (
                  <div
                    key={block.id}
                    draggable
                    className={[
                      "relative cursor-pointer transition-shadow",
                      selectedBlockId === block.id ? "ring-2 ring-primary ring-offset-0" : "hover:ring-1 hover:ring-primary/50",
                    ].join(" ")}
                    onClick={() => setSelectedBlockId(block.id)}
                    onDragStart={(event) => {
                      setDraggingBlockId(block.id);
                      event.dataTransfer.setData("application/mjg-existing-block", block.id);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const newType = event.dataTransfer.getData("application/mjg-block-type") as BlockType;
                      if (newType) addBlock(newType, block.id);
                      else reorderBlock(block.id);
                      setDraggingBlockId(null);
                    }}
                    onDragEnd={() => setDraggingBlockId(null)}
                    dangerouslySetInnerHTML={{ __html: renderCanvasBlock(block, schema.settings) }}
                  />
                ))
              ) : (
                <button type="button" className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-muted-foreground" onClick={() => addBlock("heading")}>
                  <span className="text-5xl leading-none">+</span>
                  <span>Click a block type to add it</span>
                </button>
              )}
            </div>
          </main>

          <aside className="border-t bg-card p-4 lg:border-l lg:border-t-0">
            <SettingsPanel
              block={selectedBlock}
              schema={schema}
              onDelete={deleteSelectedBlock}
              onSchemaChange={(settings) => updateSchema((current) => ({ ...current, settings: { ...current.settings, ...settings } }))}
              onBlockChange={updateSelectedBlock}
            />
          </aside>
        </div>
      ) : (
        <label className="space-y-2 text-sm font-medium">
          <span>HTML body</span>
          <textarea
            className="min-h-[42rem] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            onChange={(event) => setHtmlBody(event.target.value)}
            required
            value={htmlBody}
          />
        </label>
      )}

      <label className="space-y-2 text-sm font-medium">
        <span>Plain text body</span>
        <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setTextBody(event.target.value)} value={textBody} />
      </label>

      <p className="text-xs text-muted-foreground">
        Visual mode builds editable preview blocks and generates email-safe HTML. HTML mode lets you customize the generated markup directly.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Email preview">
          <div className="flex h-[92vh] w-full max-w-[92rem] flex-col overflow-hidden rounded-md border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Email preview</p>
                <p className="truncate text-xs text-muted-foreground">{renderedSubject}</p>
              </div>
              <Button className="ml-auto" size="icon" type="button" variant="ghost" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-muted p-2 sm:p-3">
              <div className="mx-auto w-full max-w-[86rem] overflow-hidden rounded-md border bg-white shadow-sm">
                <iframe className="h-[80vh] w-full bg-white" sandbox="" srcDoc={previewHtml} title="Email template preview" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function SettingsPanel({
  block,
  schema,
  onDelete,
  onSchemaChange,
  onBlockChange,
}: {
  block?: EmailBlock;
  schema: EmailBuilderSchema;
  onDelete: () => void;
  onSchemaChange: (settings: Partial<EmailBuilderSchema["settings"]>) => void;
  onBlockChange: (patch: Partial<EmailBlock>) => void;
}) {
  if (!block) return <p className="pt-64 text-center text-sm font-medium text-muted-foreground">Click a block to edit its settings</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{labelForBlock(block.type)} Settings</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label="Delete block">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {block.type === "header" ? (
        <>
          <TextField label="Logo/Image URL" value={block.url ?? ""} onChange={(url) => onBlockChange({ url })} placeholder="https://.../logo.png" />
          <TextField label="Alt text" value={block.alt ?? ""} onChange={(alt) => onBlockChange({ alt })} />
          <ColorTextField label="Background color" value={block.backgroundColor ?? "#111111"} onChange={(backgroundColor) => onBlockChange({ backgroundColor })} />
          <NumberField label="Logo width (px)" value={block.width ?? 240} onChange={(width) => onBlockChange({ width })} />
        </>
      ) : null}

      {block.type === "heading" ? (
        <>
          <TextareaField label="Heading text" value={block.text ?? ""} onChange={(text) => onBlockChange({ text })} />
          <label className="space-y-2 text-sm font-medium">
            <span>Level</span>
            <Select value={block.headingLevel ?? "h1"} onValueChange={(headingLevel) => onBlockChange({ headingLevel: headingLevel as "h1" | "h2" | "h3" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <NumberField label="Font size (px)" value={block.fontSize ?? 32} onChange={(fontSize) => onBlockChange({ fontSize })} />
          <ColorTextField label="Text color" value={block.textColor ?? schema.settings.textColor} onChange={(textColor) => onBlockChange({ textColor })} />
          <AlignControl value={block.align ?? "left"} onChange={(align) => onBlockChange({ align })} />
        </>
      ) : null}

      {block.type === "text" ? (
        <>
          <TextareaField label="Text" value={block.text ?? ""} onChange={(text) => onBlockChange({ text })} />
          <NumberField label="Font size (px)" value={block.fontSize ?? 16} onChange={(fontSize) => onBlockChange({ fontSize })} />
          <ColorTextField label="Text color" value={block.textColor ?? schema.settings.textColor} onChange={(textColor) => onBlockChange({ textColor })} />
          <AlignControl value={block.align ?? "left"} onChange={(align) => onBlockChange({ align })} />
        </>
      ) : null}

      {block.type === "button" ? (
        <>
          <TextField label="Button text" value={block.text ?? ""} onChange={(text) => onBlockChange({ text })} />
          <TextField label="Link URL" value={block.url ?? ""} onChange={(url) => onBlockChange({ url })} placeholder="https://..." />
          <ColorTextField label="Button color" value={block.buttonColor ?? "#2f6848"} onChange={(buttonColor) => onBlockChange({ buttonColor })} />
          <ColorTextField label="Text color" value={block.buttonTextColor ?? "#ffffff"} onChange={(buttonTextColor) => onBlockChange({ buttonTextColor })} />
          <AlignControl value={block.align ?? "left"} onChange={(align) => onBlockChange({ align })} />
        </>
      ) : null}

      {block.type === "image" ? (
        <>
          <TextField label="Image URL" value={block.url ?? ""} onChange={(url) => onBlockChange({ url })} placeholder="https://.../image.jpg" />
          <TextField label="Alt text" value={block.alt ?? ""} onChange={(alt) => onBlockChange({ alt })} />
          <TextField label="Link URL" value={block.linkUrl ?? ""} onChange={(linkUrl) => onBlockChange({ linkUrl })} placeholder="https://..." />
          <NumberField label="Width (px)" value={block.width ?? 480} onChange={(width) => onBlockChange({ width })} />
          <AlignControl value={block.align ?? "center"} onChange={(align) => onBlockChange({ align })} />
        </>
      ) : null}

      {block.type === "divider" ? (
        <>
          <ColorTextField label="Divider color" value={block.dividerColor ?? "#ddd8cc"} onChange={(dividerColor) => onBlockChange({ dividerColor })} />
          <NumberField label="Pad top (px)" value={block.padTop ?? 20} onChange={(padTop) => onBlockChange({ padTop })} />
          <NumberField label="Pad bottom (px)" value={block.padBottom ?? 20} onChange={(padBottom) => onBlockChange({ padBottom })} />
        </>
      ) : null}

      {block.type === "spacer" ? (
        <NumberField label="Height (px)" value={block.height ?? 32} onChange={(height) => onBlockChange({ height })} />
      ) : null}

      {block.type === "footer" ? (
        <>
          <TextareaField label="Footer text" value={block.text ?? ""} onChange={(text) => onBlockChange({ text })} />
          <ColorTextField label="Background color" value={block.backgroundColor ?? "#f8f6f1"} onChange={(backgroundColor) => onBlockChange({ backgroundColor })} />
          <ColorTextField label="Text color" value={block.textColor ?? "#5f6b66"} onChange={(textColor) => onBlockChange({ textColor })} />
        </>
      ) : null}

      {block.type === "columns" ? (
        <>
          <TextareaField label="Left column" value={block.columns?.[0]?.blocks[0]?.text ?? ""} onChange={(text) => onBlockChange({ columns: setColumnText(block, 0, text) })} />
          <TextareaField label="Right column" value={block.columns?.[1]?.blocks[0]?.text ?? ""} onChange={(text) => onBlockChange({ columns: setColumnText(block, 1, text) })} />
        </>
      ) : null}

      <div className="border-t pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Section</p>
        <ColorTextField label="Background color" value={block.backgroundColor ?? "transparent"} onChange={(backgroundColor) => onBlockChange({ backgroundColor })} allowTransparent />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <NumberField label="Pad top (px)" value={block.padTop ?? 24} onChange={(padTop) => onBlockChange({ padTop })} />
          <NumberField label="Pad bottom (px)" value={block.padBottom ?? 24} onChange={(padBottom) => onBlockChange({ padBottom })} />
        </div>
        <div className="mt-4">
          <NumberField label="Pad left / right (px)" value={block.padX ?? 40} onChange={(padX) => onBlockChange({ padX })} />
        </div>
      </div>

      <div className="border-t pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Email</p>
        <NumberField label="Email width" value={schema.settings.width} onChange={(width) => onSchemaChange({ width })} />
        <div className="mt-4 grid gap-4">
          <ColorTextField label="Page background" value={schema.settings.backgroundColor} onChange={(backgroundColor) => onSchemaChange({ backgroundColor })} />
          <ColorTextField label="Content background" value={schema.settings.contentColor} onChange={(contentColor) => onSchemaChange({ contentColor })} />
          <ColorTextField label="Default text" value={schema.settings.textColor} onChange={(textColor) => onSchemaChange({ textColor })} />
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span className="uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span className="uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input type="number" value={Number.isFinite(value) ? value : 0} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ColorTextField({ label, value, onChange, allowTransparent }: { label: string; value: string; onChange: (value: string) => void; allowTransparent?: boolean }) {
  const pickerValue = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <label className="space-y-2 text-sm font-medium">
      <span className="uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        <Input className="h-9 w-12 p-1" type="color" value={pickerValue} onChange={(event) => onChange(event.target.value)} />
        <Input value={value} onChange={(event) => onChange(event.target.value || (allowTransparent ? "transparent" : ""))} placeholder={allowTransparent ? "transparent" : "#000000"} />
      </div>
    </label>
  );
}

function AlignControl({ value, onChange }: { value: Align; onChange: (value: Align) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Align</p>
      <div className="grid grid-cols-3 gap-2">
        {([
          ["left", <AlignLeft key="left" className="h-4 w-4" />],
          ["center", <AlignCenter key="center" className="h-4 w-4" />],
          ["right", <AlignRight key="right" className="h-4 w-4" />],
        ] as Array<[Align, React.ReactNode]>).map(([align, icon]) => (
          <Button key={align} type="button" variant={value === align ? "default" : "outline"} onClick={() => onChange(align)}>
            {icon}
            <span className="capitalize">{align}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function createDefaultSchema(): EmailBuilderSchema {
  return {
    version: 1,
    settings: {
      width: 640,
      backgroundColor: "#f8f6f1",
      contentColor: "#ffffff",
      textColor: "#0f1f1a",
      fontFamily: "Arial, sans-serif",
    },
    blocks: [createBlock("header"), createBlock("heading"), createBlock("text"), createBlock("button"), createBlock("divider"), createBlock("footer")],
  };
}

function createBlock(type: BlockType): EmailBlock {
  const id = `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const base = { id, type, padTop: 24, padBottom: 24, padX: 40 };
  switch (type) {
    case "header":
      return { ...base, url: "", alt: "Michael J. Gauthier", backgroundColor: "#111111", width: 260, align: "center", padTop: 28, padBottom: 28 };
    case "columns":
      return {
        ...base,
        columns: [
          { blocks: [{ ...createBlock("image"), text: "Image", padX: 0, padTop: 0, padBottom: 0 }] },
          { blocks: [{ ...createBlock("image"), text: "Image", padX: 0, padTop: 0, padBottom: 0 }] },
        ],
      };
    case "heading":
      return { ...base, text: "Your Heading", headingLevel: "h1", fontSize: 32, textColor: "#000000", align: "left" };
    case "text":
      return { ...base, text: "Write your message here. Keep it clear and concise.", fontSize: 16, textColor: "#334155", align: "left", padTop: 0 };
    case "button":
      return { ...base, text: "Click Here ->", url: "{{site_url}}", buttonColor: "#c77c43", buttonTextColor: "#ffffff", align: "left", padTop: 8 };
    case "image":
      return { ...base, url: "", alt: "", linkUrl: "", width: 520, align: "center" };
    case "divider":
      return { ...base, dividerColor: "#e5e0d7", padTop: 16, padBottom: 16 };
    case "spacer":
      return { ...base, height: 32, padTop: 0, padBottom: 0 };
    case "footer":
      return {
        ...base,
        text: "Michael J. Gauthier\n{{preferences_url}} | {{unsubscribe_url}}",
        backgroundColor: "#f8f6f1",
        textColor: "#5f6b66",
        align: "center",
        fontSize: 12,
      };
  }
}

function buildHtmlWithSchema(schema: EmailBuilderSchema, preheader: string) {
  const schemaComment = `<!--${builderMarker}${encodeSchema(schema)}-->`;
  const hiddenPreheader = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all;">${escapeHtml(preheader)}</div>`
    : "";
  const body = schema.blocks.map((block) => renderEmailBlock(block, schema.settings)).join("");
  return `${schemaComment}
${hiddenPreheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${schema.settings.backgroundColor};padding:24px 0;margin:0;">
  <tr>
    <td align="center">
      <table role="presentation" width="${schema.settings.width}" cellpadding="0" cellspacing="0" style="width:100%;max-width:${schema.settings.width}px;background:${schema.settings.contentColor};font-family:${schema.settings.fontFamily};color:${schema.settings.textColor};border-radius:8px;overflow:hidden;">
        ${body}
      </table>
    </td>
  </tr>
</table>`;
}

function renderEmailBlock(block: EmailBlock, settings: EmailBuilderSchema["settings"]) {
  const background = block.backgroundColor && block.backgroundColor !== "transparent" ? `background:${block.backgroundColor};` : "";
  const padTop = block.padTop ?? 24;
  const padBottom = block.padBottom ?? 24;
  const padX = block.padX ?? 40;
  const inner = renderBlockContent(block, settings);
  return `<tr><td style="${background}padding:${padTop}px ${padX}px ${padBottom}px;">${inner}</td></tr>`;
}

function renderCanvasBlock(block: EmailBlock, settings: EmailBuilderSchema["settings"]) {
  return `<div style="font-family:${settings.fontFamily};color:${settings.textColor};">${renderEmailBlock(block, settings).replace(/^<tr><td/, "<div").replace(/<\/td><\/tr>$/, "</div>")}</div>`;
}

function renderBlockContent(block: EmailBlock, settings: EmailBuilderSchema["settings"]): string {
  const align = block.align ?? "left";
  switch (block.type) {
    case "header": {
      const logo = block.url
        ? `<img src="${escapeAttribute(block.url)}" width="${block.width ?? 260}" alt="${escapeAttribute(block.alt ?? "")}" style="display:block;width:${block.width ?? 260}px;max-width:100%;height:auto;margin:0 auto;" />`
        : `<div style="font-weight:700;letter-spacing:8px;color:#ffffff;text-align:center;">MICHAEL J. GAUTHIER</div>`;
      return `<div style="text-align:${align};">${logo}</div>`;
    }
    case "columns":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${(block.columns ?? []).map((column) => `<td width="50%" valign="top" style="padding:0 6px;">${column.blocks.map((child) => renderColumnChild(child, settings)).join("")}</td>`).join("")}</tr></table>`;
    case "heading": {
      const tag = block.headingLevel ?? "h1";
      return `<${tag} style="margin:0;font-size:${block.fontSize ?? 32}px;line-height:1.2;color:${block.textColor ?? settings.textColor};text-align:${align};font-weight:800;">${escapeHtml(block.text ?? "")}</${tag}>`;
    }
    case "text":
      return `<p style="margin:0;font-size:${block.fontSize ?? 16}px;line-height:1.6;color:${block.textColor ?? settings.textColor};text-align:${align};white-space:pre-line;">${escapeHtml(block.text ?? "")}</p>`;
    case "button":
      return `<div style="text-align:${align};"><a href="${escapeAttribute(block.url ?? "#")}" style="display:inline-block;background:${block.buttonColor ?? "#2f6848"};color:${block.buttonTextColor ?? "#ffffff"};text-decoration:none;padding:14px 24px;border-radius:6px;font-size:16px;font-weight:700;">${escapeHtml(block.text ?? "Click Here")}</a></div>`;
    case "image": {
      const image = block.url
        ? `<img src="${escapeAttribute(block.url)}" width="${block.width ?? 520}" alt="${escapeAttribute(block.alt ?? "")}" style="display:block;width:${block.width ?? 520}px;max-width:100%;height:auto;border:0;margin:0 auto;" />`
        : `<div style="height:128px;border-radius:6px;background:#f0f1f4;color:#9aa3b2;display:flex;align-items:center;justify-content:center;">No image URL set</div>`;
      const wrapped = block.linkUrl ? `<a href="${escapeAttribute(block.linkUrl)}" style="text-decoration:none;">${image}</a>` : image;
      return `<div style="text-align:${align};">${wrapped}</div>`;
    }
    case "divider":
      return `<div style="border-top:1px solid ${block.dividerColor ?? "#ddd8cc"};font-size:0;line-height:0;">&nbsp;</div>`;
    case "spacer":
      return `<div style="height:${block.height ?? 32}px;font-size:0;line-height:0;">&nbsp;</div>`;
    case "footer":
      return `<p style="margin:0;font-size:${block.fontSize ?? 12}px;line-height:1.6;color:${block.textColor ?? "#5f6b66"};text-align:${align};white-space:pre-line;">${escapeHtml(block.text ?? "")}</p>`;
  }
}

function renderColumnChild(block: EmailBlock, settings: EmailBuilderSchema["settings"]): string {
  if (block.type === "image" && !block.url) {
    return `<div style="height:90px;border:1px dashed #cbd5e1;border-radius:6px;background:#f8fafc;color:#94a3b8;display:flex;align-items:center;justify-content:center;">Image</div>`;
  }
  return renderBlockContent(block, settings);
}

function buildPreviewHtml(body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#f1eee7;}img{max-width:100%;height:auto;}table{border-collapse:collapse;}</style></head><body>${body}</body></html>`;
}

function renderMergeFields(value: string) {
  return value.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => sampleMergeData[key] ?? "");
}

function insertBlock(blocks: EmailBlock[], block: EmailBlock, afterId?: string) {
  if (!afterId) return [...blocks, block];
  const index = blocks.findIndex((item) => item.id === afterId);
  if (index < 0) return [...blocks, block];
  return [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)];
}

function moveBlock(blocks: EmailBlock[], blockId: string, targetId: string) {
  const currentIndex = blocks.findIndex((block) => block.id === blockId);
  const targetIndex = blocks.findIndex((block) => block.id === targetId);
  if (currentIndex < 0 || targetIndex < 0) return blocks;
  const next = [...blocks];
  const [block] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, block);
  return next;
}

function updateBlock(blocks: EmailBlock[], blockId: string, patch: Partial<EmailBlock>): EmailBlock[] {
  return blocks.map((block) => block.id === blockId ? { ...block, ...patch } : block);
}

function findBlock(blocks: EmailBlock[], blockId: string) {
  return blocks.find((block) => block.id === blockId);
}

function setColumnText(block: EmailBlock, index: number, text: string) {
  const columns = block.columns?.map((column) => ({ blocks: column.blocks.map((child) => ({ ...child })) })) ?? [{ blocks: [] }, { blocks: [] }];
  const child = columns[index]?.blocks[0] ?? createBlock("text");
  columns[index] = { blocks: [{ ...child, type: "text", text, fontSize: 15, textColor: "#334155" }] };
  return columns;
}

function encodeSchema(schema: EmailBuilderSchema) {
  return encodeURIComponent(JSON.stringify(schema));
}

function decodeSchema(value: string) {
  return JSON.parse(decodeURIComponent(value)) as EmailBuilderSchema;
}

function extractBuilderSchema(html?: string | null) {
  if (!html) return null;
  const match = html.match(/<!--MJG_BUILDER_SCHEMA:([\s\S]*?)-->/);
  if (!match) return null;
  try {
    return decodeSchema(match[1]);
  } catch {
    return null;
  }
}

function labelForBlock(type: BlockType) {
  return blockPalette.find((block) => block.type === type)?.label ?? "Block";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char] ?? char));
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
