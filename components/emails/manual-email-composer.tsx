"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bold, Image, Italic, Link as LinkIcon, List, Paperclip, Send, Square, Type, Underline } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserOption = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
};

export function ManualEmailComposer({ users }: { users: UserOption[] }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hi {{first_name}},</p><p></p>");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recipients = useMemo(
    () => Array.from(new Set([...selectedUserEmails, ...parseEmails(manualEmails)])),
    [selectedUserEmails, manualEmails],
  );

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
  }

  function syncHtml() {
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function insertHtml(value: string) {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, value);
    syncHtml();
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const data = new FormData();
    data.set("recipients", recipients.join(","));
    data.set("cc", cc);
    data.set("bcc", bcc);
    data.set("subject", subject);
    data.set("html", html);
    data.set("text", stripHtml(html));
    attachments.forEach((file) => data.append("attachments", file));

    const response = await fetch("/api/admin/email/manual", { method: "POST", body: data });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Email could not be sent.");
      setLoading(false);
      return;
    }

    setMessage(`Sent ${payload.sent}, skipped ${payload.skipped}.`);
    setLoading(false);
  }

  return (
    <form className="space-y-5" onSubmit={send}>
      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">To</span>
          <Input
            value={manualEmails}
            onChange={(event) => setManualEmails(event.target.value)}
            placeholder="person@example.com, another@example.com"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <Accordion type="single" collapsible className="border-b px-4">
          <AccordionItem value="dashboard-users" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              <span className="flex flex-wrap items-center gap-2 text-left">
                Add dashboard users
                {selectedUserEmails.length ? <Badge variant="secondary">{selectedUserEmails.length} selected</Badge> : null}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="max-h-56 overflow-auto rounded-md border bg-background p-2">
                {users.map((user) => (
                  <label key={user.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent">
                    <input
                      checked={selectedUserEmails.includes(user.email)}
                      onChange={(event) =>
                        setSelectedUserEmails((current) =>
                          event.target.checked ? [...current, user.email] : current.filter((email) => email !== user.email),
                        )
                      }
                      type="checkbox"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{user.full_name || user.email}</span>
                      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </label>
                ))}
                {!users.length ? <p className="p-2 text-sm text-muted-foreground">No active users found.</p> : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {recipients.length ? (
          <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            {recipients.map((email) => (
              <Badge key={email} variant="secondary">
                {email}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">CC</span>
          <Input
            value={cc}
            onChange={(event) => setCc(event.target.value)}
            placeholder="Optional CC recipients"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">BCC</span>
          <Input
            value={bcc}
            onChange={(event) => setBcc(event.target.value)}
            placeholder="Optional BCC recipients"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-3 px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">Subject</span>
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
            required
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-md border bg-card p-3">
        <div className="flex flex-wrap gap-2">
          <ToolbarButton label="Bold" icon={<Bold className="h-4 w-4" />} onClick={() => exec("bold")} />
          <ToolbarButton label="Italic" icon={<Italic className="h-4 w-4" />} onClick={() => exec("italic")} />
          <ToolbarButton label="Underline" icon={<Underline className="h-4 w-4" />} onClick={() => exec("underline")} />
          <ToolbarButton label="List" icon={<List className="h-4 w-4" />} onClick={() => exec("insertUnorderedList")} />
          <ToolbarButton label="Link" icon={<LinkIcon className="h-4 w-4" />} onClick={() => exec("createLink", window.prompt("Enter URL") || "")} />
          <ToolbarButton label="Heading" icon={<Type className="h-4 w-4" />} onClick={() => exec("formatBlock", "h2")} />
          <ToolbarButton label="Button" icon={<Square className="h-4 w-4" />} onClick={() => insertHtml(`<p><a href="{{site_url}}" style="display:inline-block;background:#2f6848;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;">Button Text</a></p>`)} />
          <ToolbarButton label="Image" icon={<Image className="h-4 w-4" />} onClick={() => insertHtml(`<p><img src="https://via.placeholder.com/640x260" alt="Email image" style="max-width:100%;height:auto;border-radius:8px;" /></p>`)} />
        </div>
        <div
          ref={editorRef}
          className="min-h-72 rounded-md border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          contentEditable
          dangerouslySetInnerHTML={{ __html: html }}
          onInput={syncHtml}
          role="textbox"
          aria-label="Email body"
        />
      </div>

      <label className="space-y-2 text-sm font-medium">
        <span>Attachments</span>
        <Input multiple type="file" onChange={(event) => setAttachments(Array.from(event.target.files ?? []))} />
      </label>
      {attachments.length ? (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {attachments.map((file) => (
            <span key={`${file.name}-${file.size}`} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
              <Paperclip className="h-3 w-3" />
              {file.name}
            </span>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button disabled={loading || !subject || !recipients.length || !html} type="submit">
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Send email"}
      </Button>
    </form>
  );
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={onClick} title={label}>
      {icon}
      {label}
    </Button>
  );
}

function parseEmails(value: string) {
  return value
    .split(/[,;\s]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
