// In-iframe visual selection engine for the CMS "Frontend Edits" tab.
// Framework-agnostic, zero-dependency; operates on a SAME-ORIGIN iframe
// Document/Window. Ported from docs/features/frontend-page-editor-portable.md §7.
// classify() is tuned below for the MJG public site (plain HTML sections + the
// CMS renderer's <section> bands + Tailwind-ish utility classes).

export type Pt = { x: number; y: number };
export type ElementDescriptor = {
  element_ref: string; element_type: string; element_label: string;
  heading_text: string | null; heading_level: number | null; section_order: number | null;
  parent_section_label: string | null; dom_selector: string | null; dom_path: string | null;
  css_classes: string | null; component_name: string | null; content_summary: string | null;
  bounding_box: { x: number; y: number; width: number; height: number } | null;
};
export type SelectionMode =
  | "auto" | "sections" | "containers" | "rows" | "columns" | "cards" | "components" | "headings"
  | "icons" | "content" | "eyebrows" | "buttons" | "links" | "images";
export type OutlineItem = { element_ref: string; type: string; label: string; level: number | null };

export type OverlayHandlers = {
  slug: string;
  mode: SelectionMode;
  active: boolean;
  onSelect: (d: ElementDescriptor) => void;
  onOverlap: (candidates: ElementDescriptor[], clientX: number, clientY: number) => void;
  onOutline: (items: OutlineItem[]) => void;
};
export type OverlayController = {
  setMode: (m: SelectionMode) => void;
  setActive: (a: boolean) => void;
  setInsertMode: (on: boolean) => void;
  selectByRef: (ref: string) => ElementDescriptor | null;
  clearSelection: () => void;
  scanOutline: () => void;
  destroy: () => void;
};

const MEANINGFUL = ["section", "container", "row", "column", "card", "component", "form", "button", "link", "icon", "image", "content", "eyebrow"];
const getClass = (el: Element) => (typeof (el as HTMLElement).className === "string" ? (el as HTMLElement).className.toLowerCase() : "");

// ── Tuned for the MJG public site + CMS renderer markup ─────────────────────
function classify(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return tag;
  const cls = getClass(el);
  if (tag === "svg" || (tag === "i" && /\b(icon|fa-|bi-|lucide)\b/.test(cls)) || el.getAttribute("role") === "img" && tag !== "img") return "icon";
  if (tag === "img" || tag === "picture") return "image";
  if (["section", "header", "footer", "main"].includes(tag) || /\bsection\b/.test(cls)) return "section";
  if (tag === "form") return "form";
  if (tag === "nav") return "component";
  const role = el.getAttribute("role");
  if (tag === "button" || (tag === "a" && (role === "button" || /\bbtn\b|\bbutton\b/.test(cls)))) return "button";
  if (tag === "a") return "link";
  if (/\beyebrow\b|\boverline\b|\bkicker\b/.test(cls)) return "eyebrow";
  if (/container|wrapper|\bmx-auto\b/.test(cls)) return "container";
  if (/\brow\b|\bgrid\b|grid-cols|\bflex\b/.test(cls)) return "row";
  if (/\bcol(-|\b)|col-span/.test(cls)) return "column";
  if (/\bcard\b/.test(cls)) return "card";
  if (tag === "p" || /\bprose\b|\bbody-copy\b/.test(cls)) return "content";
  if (/\bbtn\b|\bbutton\b/.test(cls)) return "button";
  return tag;
}
// ────────────────────────────────────────────────────────────────────────────

const isMeaningful = (el: Element) => { const t = classify(el); return /^h[1-6]$/.test(t) || MEANINGFUL.includes(t); };

function matchesMode(el: Element, mode: SelectionMode): boolean {
  const t = classify(el);
  switch (mode) {
    case "headings": return /^h[1-6]$/.test(t);
    case "sections": return t === "section";
    case "containers": return t === "container";
    case "rows": return t === "row";
    case "columns": return t === "column";
    case "cards": return t === "card";
    case "components": return t === "component" || t === "form";
    case "icons": return t === "icon";
    case "images": return t === "image";
    case "buttons": return t === "button";
    case "links": return t === "link";
    case "eyebrows": return t === "eyebrow";
    case "content": return t === "content" || /^h[1-6]$/.test(t);
    default: return isMeaningful(el); // auto
  }
}

function domIndexPath(el: Element, doc: Document): string {
  const parts: string[] = []; let node: Element | null = el;
  while (node && node !== doc.body && node.parentElement) {
    const par: HTMLElement = node.parentElement;
    parts.unshift(`${node.tagName.toLowerCase()}[${Array.prototype.indexOf.call(par.children, node)}]`);
    node = par;
  }
  return parts.join("/");
}
function domPath(el: Element): string {
  const tags: string[] = []; let node: Element | null = el; let d = 0;
  while (node && node.tagName && node.tagName.toLowerCase() !== "html" && d < 12) { tags.unshift(node.tagName.toLowerCase()); node = node.parentElement; d++; }
  return tags.join(">");
}
function nthOfType(el: Element): number { let i = 1, s = el.previousElementSibling; while (s) { if (s.tagName === el.tagName) i++; s = s.previousElementSibling; } return i; }
function cssSelector(el: Element, doc: Document): string {
  const parts: string[] = []; let node: Element | null = el; let d = 0;
  while (node && node !== doc.body && node.parentElement && d < 8) {
    if (node.id) { parts.unshift(`#${node.id}`); break; }
    parts.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${nthOfType(node)})`); node = node.parentElement; d++;
  }
  return parts.join(" > ");
}
const textOf = (el: Element, max = 120) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, max);
function sectionLabel(el: Element): string {
  const aria = el.getAttribute("aria-label"); if (aria) return aria.slice(0, 60);
  const h = el.querySelector("h1,h2,h3,h4,h5,h6"); if (h) return textOf(h, 60) || "Section";
  if (el.id) return el.id;
  const cls = (el as HTMLElement).className; if (typeof cls === "string" && cls.trim()) return cls.trim().split(/\s+/)[0];
  return el.tagName.toLowerCase();
}
function nearestSection(el: Element): Element | null {
  let node: Element | null = el;
  while (node && node !== node.ownerDocument?.body) { if (classify(node) === "section" && node !== el) return node; node = node.parentElement; }
  return null;
}

export function installOverlay(doc: Document, win: Window, handlers: OverlayHandlers): OverlayController {
  let mode = handlers.mode, active = handlers.active;
  const refMap = new Map<string, HTMLElement>();

  const hoverBox = doc.createElement("div"), selBox = doc.createElement("div");
  const base = "position:absolute;pointer-events:none;z-index:2147483646;box-sizing:border-box;border-radius:2px;transition:all .04s linear;";
  hoverBox.style.cssText = base + "border:2px solid #c9a46e;background:rgba(201,164,110,.14);display:none;";
  selBox.style.cssText = base + "border:2px solid #315f43;background:rgba(49,95,67,.12);display:none;";
  const label = doc.createElement("div");
  label.style.cssText = "position:absolute;top:-18px;left:0;background:#c9a46e;color:#111;font:700 10px/16px system-ui,sans-serif;padding:0 6px;border-radius:3px;white-space:nowrap;letter-spacing:.04em;";
  hoverBox.appendChild(label);
  if (doc.body) { doc.body.appendChild(hoverBox); doc.body.appendChild(selBox); }
  let selectedEl: HTMLElement | null = null;

  function place(box: HTMLElement, el: Element) {
    const r = el.getBoundingClientRect();
    box.style.display = "block";
    box.style.left = `${r.left + win.scrollX}px`; box.style.top = `${r.top + win.scrollY}px`;
    box.style.width = `${r.width}px`; box.style.height = `${r.height}px`;
  }

  function buildDescriptor(el: Element): ElementDescriptor {
    const type = classify(el), isH = /^h[1-6]$/.test(type);
    const headingText = isH ? textOf(el, 160) : null;
    const section = nearestSection(el);
    const allSections = Array.from(doc.querySelectorAll("section, header, footer, main"));
    const sectionOrder = section ? allSections.indexOf(section) : (type === "section" ? allSections.indexOf(el) : null);
    const clsRaw = (el as HTMLElement).className; const cls = typeof clsRaw === "string" ? clsRaw : "";
    const refText = isH && headingText ? `::${headingText.slice(0, 60)}` : "";
    const element_ref = `${handlers.slug}::${type}::${domIndexPath(el, doc)}${refText}`;
    refMap.set(element_ref, el as HTMLElement);
    const r = el.getBoundingClientRect();
    return {
      element_ref, element_type: type,
      element_label: isH ? (headingText || `${type.toUpperCase()} heading`) : (type === "section" ? sectionLabel(el) : (textOf(el, 48) || type)),
      heading_text: headingText, heading_level: isH ? Number(type[1]) : null, section_order: sectionOrder,
      parent_section_label: section ? sectionLabel(section) : (type === "section" ? sectionLabel(el) : null),
      dom_selector: cssSelector(el, doc), dom_path: domPath(el), css_classes: cls || null,
      component_name: type === "component" ? el.tagName.toLowerCase() : null,
      content_summary: textOf(el, 160) || null,
      bounding_box: { x: Math.round(r.left + win.scrollX), y: Math.round(r.top + win.scrollY), width: Math.round(r.width), height: Math.round(r.height) },
    };
  }

  function candidateFor(target: Element): Element | null {
    let node: Element | null = target;
    while (node && node !== doc.body) { if (matchesMode(node, mode)) return node; node = node.parentElement; }
    return null;
  }
  function overlapCandidates(target: Element): Element[] {
    const out: Element[] = [], seen = new Set<string>(); let node: Element | null = target;
    while (node && node !== doc.body && out.length < 6) {
      if (isMeaningful(node)) { const t = classify(node); if (!seen.has(t)) { seen.add(t); out.push(node); } }
      node = node.parentElement;
    }
    return out;
  }

  let raf = false;
  function onMove(e: MouseEvent) {
    if (!active || raf) return; raf = true;
    win.requestAnimationFrame(() => {
      raf = false;
      const t = e.target as Element | null;
      if (!t || t === hoverBox || t === selBox) { hoverBox.style.display = "none"; return; }
      const c = candidateFor(t);
      if (!c) { hoverBox.style.display = "none"; return; }
      place(hoverBox, c); label.textContent = classify(c).toUpperCase();
    });
  }
  function onClick(e: MouseEvent) {
    if (!active) return;
    const t = e.target as Element | null; if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (mode === "auto") {
      const cands = overlapCandidates(t); if (!cands.length) return;
      if (cands.length === 1) { const d = buildDescriptor(cands[0]); selectedEl = cands[0] as HTMLElement; place(selBox, cands[0]); handlers.onSelect(d); }
      else handlers.onOverlap(cands.map(buildDescriptor), e.clientX, e.clientY);
      return;
    }
    const c = candidateFor(t); if (!c) return;
    const d = buildDescriptor(c); selectedEl = c as HTMLElement; place(selBox, c); handlers.onSelect(d);
  }
  // ── Insert markers ("+ Add content here" between top-level sections) ──
  let insertMode = false;
  const markers: { btn: HTMLElement; sec: Element; edge: "before" | "after" }[] = [];
  const topSections = () => Array.from(doc.querySelectorAll("section")).filter((s) => !s.parentElement || !s.parentElement.closest("section"));
  function clearMarkers() { markers.forEach((m) => m.btn.remove()); markers.length = 0; }
  function placeMarker(m: { btn: HTMLElement; sec: Element; edge: "before" | "after" }) {
    const r = m.sec.getBoundingClientRect();
    m.btn.style.top = `${(m.edge === "before" ? r.top : r.bottom) + win.scrollY - 15}px`;
    m.btn.style.left = `${r.left + win.scrollX + r.width / 2 - 84}px`;
  }
  function insertDescriptor(index: number, prev: Element | null, next: Element | null): ElementDescriptor {
    const prevLabel = prev ? sectionLabel(prev) : null, nextLabel = next ? sectionLabel(next) : null;
    const label = prevLabel && nextLabel ? `Insert between “${prevLabel}” and “${nextLabel}”`
      : nextLabel ? `Insert before “${nextLabel}”` : prevLabel ? `Insert after “${prevLabel}”` : "Insert content";
    return {
      element_ref: `${handlers.slug}::section_insert::${index}`, element_type: "section_insert", element_label: label,
      heading_text: null, heading_level: null, section_order: index, parent_section_label: prevLabel || nextLabel,
      dom_selector: null, dom_path: null, css_classes: null, component_name: null, content_summary: null, bounding_box: null,
    };
  }
  function renderMarkers() {
    clearMarkers();
    if (!insertMode) return;
    const secs = topSections();
    const add = (index: number, sec: Element, edge: "before" | "after", prev: Element | null, next: Element | null) => {
      const btn = doc.createElement("button");
      btn.textContent = "+ Add content here";
      btn.style.cssText = "position:absolute;z-index:2147483645;background:#c9a46e;color:#111;font:700 11px/1 system-ui,sans-serif;border:none;border-radius:999px;padding:7px 14px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.28);pointer-events:auto;white-space:nowrap;";
      btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); handlers.onSelect(insertDescriptor(index, prev, next)); });
      doc.body.appendChild(btn);
      const m = { btn, sec, edge }; markers.push(m); placeMarker(m);
    };
    secs.forEach((sec, i) => add(i, sec, "before", secs[i - 1] ?? null, sec));
    if (secs.length) add(secs.length, secs[secs.length - 1], "after", secs[secs.length - 1], null);
  }

  function reposition() {
    if (selectedEl && doc.body.contains(selectedEl)) place(selBox, selectedEl); else selBox.style.display = "none";
    markers.forEach(placeMarker);
  }

  doc.addEventListener("mousemove", onMove, true);
  doc.addEventListener("click", onClick, true);
  win.addEventListener("scroll", reposition, true);
  win.addEventListener("resize", reposition);

  return {
    setMode(m) { mode = m; hoverBox.style.display = "none"; },
    setActive(a) { active = a; if (!a) hoverBox.style.display = "none"; },
    setInsertMode(on) { insertMode = on; renderMarkers(); },
    selectByRef(ref) {
      const el = refMap.get(ref); if (!el || !doc.body.contains(el)) return null;
      const d = buildDescriptor(el); selectedEl = el; place(selBox, el);
      el.scrollIntoView({ behavior: "smooth", block: "center" }); return d;
    },
    clearSelection() { selectedEl = null; selBox.style.display = "none"; },
    scanOutline() {
      const items: OutlineItem[] = [];
      const set = Array.from(doc.querySelectorAll("section, header, main, h1, h2, h3, h4, h5, h6")).slice(0, 60);
      for (const el of set) {
        const d = buildDescriptor(el), t = classify(el);
        items.push({ element_ref: d.element_ref, type: t, label: d.element_label || sectionLabel(el), level: /^h[1-6]$/.test(t) ? Number(t[1]) : null });
      }
      handlers.onOutline(items);
    },
    destroy() {
      doc.removeEventListener("mousemove", onMove, true);
      doc.removeEventListener("click", onClick, true);
      win.removeEventListener("scroll", reposition, true);
      win.removeEventListener("resize", reposition);
      clearMarkers(); hoverBox.remove(); selBox.remove(); refMap.clear();
    },
  };
}
