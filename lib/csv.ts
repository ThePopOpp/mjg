// A small RFC 4180-ish CSV parser shared by the admin imports (contacts, facilitators).
// Handles quoted fields, escaped quotes ("") and newlines inside quotes; skips blank lines.

export function normalizeHeader(h: string) {
  return h.replace(/^﻿/, "").trim().toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
}

export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuote = false;

  const endField = () => { record.push(field.trim()); field = ""; };
  const endRecord = () => {
    endField();
    if (record.some((v) => v !== "")) records.push(record);
    record = [];
  };

  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuote) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuote = false;
      } else field += ch;
    } else if (ch === '"') inQuote = true;
    else if (ch === ",") endField();
    else if (ch === "\n") endRecord();
    else if (ch === "\r") { if (src[i + 1] !== "\n") endRecord(); }
    else field += ch;
  }
  if (field !== "" || record.length) endRecord();

  if (!records.length) return { headers: [], rows: [] };
  return { headers: records[0], rows: records.slice(1) };
}

/** Rows as objects keyed by canonical column names (via an alias map of normalized headers). */
export function csvToObjects(text: string, aliases: Record<string, string>): { columns: string[]; records: Record<string, string>[] } {
  const { headers, rows } = parseCSV(text);
  const columns = headers.map((h) => aliases[normalizeHeader(h)] ?? "");
  const records = rows.map((row) => {
    const out: Record<string, string> = {};
    columns.forEach((col, i) => { if (col && row[i] !== undefined && row[i] !== "") out[col] = row[i]; });
    return out;
  });
  return { columns: columns.filter(Boolean), records };
}
