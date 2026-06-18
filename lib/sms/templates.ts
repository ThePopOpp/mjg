const FIELD_REGEX = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function renderSmsTemplate(body: string, data: Record<string, string>): string {
  return body.replace(FIELD_REGEX, (_, key) => data[key] ?? "");
}

export function extractSmsFields(body: string): string[] {
  const fields: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(FIELD_REGEX.source, "g");
  while ((match = re.exec(body)) !== null) {
    const field = match[1];
    if (!seen.has(field)) {
      seen.add(field);
      fields.push(field);
    }
  }
  return fields;
}

export function buildSmsSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function smsSegmentCount(body: string): number {
  const len = body.length;
  if (len === 0) return 0;
  const isUnicode = /[^\x00-\x7F]/.test(body);
  const segLen = isUnicode ? 70 : 160;
  const contLen = isUnicode ? 67 : 153;
  if (len <= segLen) return 1;
  return Math.ceil((len - segLen) / contLen) + 1;
}
