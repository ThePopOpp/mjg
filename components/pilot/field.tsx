"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-semibold text-foreground">{children}</label>;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-card/70 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        props.className,
      )}
    />
  );
}

export function SelectField({
  children,
  className,
  defaultValue,
  name,
  required,
  disabled,
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const options = useMemo(
    () =>
      React.Children.toArray(children)
        .filter(React.isValidElement)
        .map((child) => {
          const props = child.props as { value?: string; children?: React.ReactNode };
          const label = typeof props.children === "string" ? props.children : String(props.value ?? "");
          return { value: String(props.value ?? label), label };
        }),
    [children],
  );
  const initialValue = String(defaultValue ?? options[0]?.value ?? "");
  const [value, setValue] = useState(initialValue);

  return (
    <>
      {name ? <input name={name} required={required} type="hidden" value={value} /> : null}
      <Select value={value} onValueChange={setValue} disabled={disabled}>
        <SelectTrigger className={cn("bg-card/70", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
