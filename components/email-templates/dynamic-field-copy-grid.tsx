"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DynamicFieldCopyGrid({ fields }: { fields: readonly string[] }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function copyField(field: string) {
    const value = `{{${field}}}`;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1600);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Click a field to copy it, then paste it into the subject, HTML body, plain text body, or simple editor.</p>
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => {
          const copied = copiedField === field;
          return (
            <Button key={field} type="button" variant={copied ? "default" : "outline"} size="sm" onClick={() => copyField(field)}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : `{{${field}}}`}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
