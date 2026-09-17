"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

export type SmsRecipientOption = {
  id: string;
  kind: "profile" | "participant" | "contact";
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  phone: string;
  phoneDisplay: string;
};

/**
 * Searchable recipient picker: choose a known person by name, email or number, or type a
 * number that isn't in the directory. The chosen value is always an E.164 phone string, so
 * the caller's send payload is unchanged.
 */
export function SmsRecipientPicker({
  value,
  onChange,
  placeholder = "Search name, email or number…",
}: {
  value: string;
  onChange: (phone: string) => void;
  placeholder?: string;
}) {
  const token = useDashboardActionToken();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SmsRecipientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SmsRecipientOption | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Load (and re-filter) the directory as they type. Debounced so typing isn't chatty.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("search", query.trim());
        const res = await fetch(`/api/admin/sms/recipients?${params}`, {
          headers: { "x-mjg-action-token": token ?? "" },
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setOptions(data.recipients ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, token]);

  // A typed number that matches nobody is still a valid recipient.
  const typedDigits = query.replace(/\D/g, "");
  const manualOption = useMemo(() => {
    if (typedDigits.length < 10) return null;
    const e164 = typedDigits.length === 10 ? `+1${typedDigits}` : `+${typedDigits}`;
    if (options.some((o) => o.phone.replace(/\D/g, "").endsWith(typedDigits.slice(-10)))) return null;
    return e164;
  }, [typedDigits, options]);

  function choose(option: SmsRecipientOption | null, phone: string) {
    setSelected(option);
    onChange(phone);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    setSelected(null);
    onChange("");
    setQuery("");
  }

  return (
    <div ref={boxRef} className="relative">
      {value && !open ? (
        // Chosen state — show who it's going to, with a clear button.
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors hover:border-[#b88a4a]"
        >
          {selected ? (
            <UserAvatar
              firstName={selected.firstName}
              lastName={selected.lastName}
              email={selected.email}
              avatarUrl={selected.avatarUrl}
              className="h-8 w-8 shrink-0"
            />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{selected?.name ?? value}</span>
            {selected ? <span className="block truncate text-xs text-muted-foreground">{selected.phoneDisplay}</span> : null}
          </span>
          <span
            role="button"
            aria-label="Clear recipient"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
          />
          <ChevronsUpDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {open ? (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-background p-1 shadow-lg">
          {loading ? (
            <p className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </p>
          ) : null}

          {!loading && manualOption ? (
            <button
              type="button"
              onClick={() => choose(null, manualOption)}
              className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs">#</span>
              <span>
                Send to <span className="font-medium">{manualOption}</span>
                <span className="block text-xs text-muted-foreground">Not in your contacts — send anyway</span>
              </span>
            </button>
          ) : null}

          {!loading &&
            options.map((o) => (
              <button
                key={`${o.kind}-${o.id}`}
                type="button"
                onClick={() => choose(o, o.phone)}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left hover:bg-accent"
              >
                <UserAvatar
                  firstName={o.firstName}
                  lastName={o.lastName}
                  email={o.email}
                  avatarUrl={o.avatarUrl}
                  className="h-8 w-8 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{o.name ?? o.phoneDisplay}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {o.phoneDisplay}
                    {o.email ? ` · ${o.email}` : ""}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] capitalize text-muted-foreground">{o.kind}</span>
                {value === o.phone ? <Check className="h-4 w-4 shrink-0 text-[#b88a4a]" /> : null}
              </button>
            ))}

          {!loading && !options.length && !manualOption ? (
            <p className="p-3 text-sm text-muted-foreground">
              {query.trim() ? "No matches. Type a full phone number to send anyway." : "No contacts with phone numbers yet."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
