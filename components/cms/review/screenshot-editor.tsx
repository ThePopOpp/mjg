"use client";

// Annotation editor: crop to a region + draw (pen/arrow/box/highlighter), then
// flatten to a JPEG dataURL. Dependency-free canvas core from
// docs/features/dashboard-review-fab-portable.md §6.

import * as React from "react";
import { Crop, Pen, ArrowUpRight, Square as SquareIcon, Highlighter, Undo2, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Pt = { x: number; y: number };
type Tool = "crop" | "pen" | "arrow" | "rect" | "highlight";
type FreeShape = { tool: "pen" | "highlight"; color: string; size: number; points: Pt[] };
type LineShape = { tool: "arrow" | "rect"; color: string; size: number; a: Pt; b: Pt };
type Shape = FreeShape | LineShape;
const isFree = (s: Shape): s is FreeShape => s.tool === "pen" || s.tool === "highlight";

const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
  if (!s || !s.tool) return;
  ctx.lineJoin = ctx.lineCap = "round";
  switch (s.tool) {
    case "pen": case "highlight": {
      ctx.strokeStyle = s.tool === "highlight" ? hexA(s.color, 0.35) : s.color;
      ctx.lineWidth = s.tool === "highlight" ? s.size * 4 : s.size;
      ctx.beginPath(); (s as FreeShape).points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
      break;
    }
    case "rect": { const l = s as LineShape; ctx.strokeStyle = l.color; ctx.lineWidth = l.size; ctx.strokeRect(l.a.x, l.a.y, l.b.x - l.a.x, l.b.y - l.a.y); break; }
    case "arrow": {
      const l = s as LineShape; ctx.strokeStyle = l.color; ctx.lineWidth = l.size;
      ctx.beginPath(); ctx.moveTo(l.a.x, l.a.y); ctx.lineTo(l.b.x, l.b.y); ctx.stroke();
      const ang = Math.atan2(l.b.y - l.a.y, l.b.x - l.a.x), head = 10 + l.size * 2.5;
      ctx.beginPath();
      ctx.moveTo(l.b.x, l.b.y); ctx.lineTo(l.b.x - head * Math.cos(ang - Math.PI / 7), l.b.y - head * Math.sin(ang - Math.PI / 7));
      ctx.moveTo(l.b.x, l.b.y); ctx.lineTo(l.b.x - head * Math.cos(ang + Math.PI / 7), l.b.y - head * Math.sin(ang + Math.PI / 7));
      ctx.stroke(); break;
    }
  }
}
function composite(img: HTMLImageElement, shapes: Shape[]): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0); shapes.forEach((s) => drawShape(ctx, s)); return c;
}

const COLORS = ["#ef4444", "#c9a46e", "#315f43", "#2563eb", "#111111", "#ffffff"];
const TOOLS: { key: Tool; icon: React.ElementType; label: string }[] = [
  { key: "crop", icon: Crop, label: "Crop" }, { key: "pen", icon: Pen, label: "Pen" },
  { key: "arrow", icon: ArrowUpRight, label: "Arrow" }, { key: "rect", icon: SquareIcon, label: "Box" },
  { key: "highlight", icon: Highlighter, label: "Highlighter" },
];

export function ScreenshotEditor({ dataUrl, onSave, onCancel }: { dataUrl: string; onSave: (d: string) => void; onCancel: () => void }) {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);
  const [shapes, setShapes] = React.useState<Shape[]>([]);
  const [tool, setTool] = React.useState<Tool>("pen");
  const [color, setColor] = React.useState("#ef4444");
  const [size, setSize] = React.useState(4);
  const draft = React.useRef<Shape | null>(null);
  const crop = React.useRef<{ a: Pt; b: Pt } | null>(null);
  const [cropDims, setCropDims] = React.useState<{ w: number; h: number } | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => { const i = new Image(); i.onload = () => setImg(i); i.src = dataUrl; }, [dataUrl]);

  const redraw = React.useCallback(() => {
    const c = canvasRef.current; if (!c || !img) return;
    const ctx = c.getContext("2d")!; ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
    const all = draft.current ? [...shapes, draft.current] : shapes;
    all.forEach((s) => drawShape(ctx, s));
    if (crop.current) {
      const { a, b } = crop.current; const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
      ctx.save(); ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.fillRect(0, 0, c.width, y); ctx.fillRect(0, y + h, c.width, c.height - y - h); ctx.fillRect(0, y, x, h); ctx.fillRect(x + w, y, c.width - x - w, h);
      ctx.strokeStyle = "#c9a46e"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(x, y, w, h); ctx.restore();
    }
  }, [img, shapes]);
  React.useEffect(() => { const c = canvasRef.current; if (c && img) { c.width = img.width; c.height = img.height; } redraw(); }, [img, redraw]);

  function toCanvas(e: React.PointerEvent): Pt {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }
  function down(e: React.PointerEvent) {
    e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = toCanvas(e);
    if (tool === "crop") { crop.current = { a: p, b: p }; setCropDims({ w: 0, h: 0 }); return; }
    draft.current = tool === "pen" || tool === "highlight" ? { tool, color, size, points: [p] } : { tool, color, size, a: p, b: p };
    redraw();
  }
  function move(e: React.PointerEvent) {
    const p = toCanvas(e);
    if (tool === "crop" && crop.current) { crop.current.b = p; setCropDims({ w: Math.round(Math.abs(p.x - crop.current.a.x)), h: Math.round(Math.abs(p.y - crop.current.a.y)) }); redraw(); return; }
    const d = draft.current; if (!d) return;
    if (isFree(d)) d.points.push(p); else d.b = p;
    redraw();
  }
  function up() {
    // Capture the finished shape in a local BEFORE nulling the ref, so the async
    // setShapes updater can never read a null draft (which crashed redraw on .tool).
    const d = draft.current;
    draft.current = null;
    if (tool !== "crop" && d) setShapes((s) => [...s, d]);
  }
  function applyCrop() {
    if (!img || !crop.current) return;
    const { a, b } = crop.current; const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    if (w < 8 || h < 8) { crop.current = null; setCropDims(null); redraw(); return; }
    const flat = composite(img, shapes);
    const out = document.createElement("canvas"); out.width = w; out.height = h;
    out.getContext("2d")!.drawImage(flat, x, y, w, h, 0, 0, w, h);
    const ni = new Image(); ni.onload = () => { setImg(ni); setShapes([]); crop.current = null; setCropDims(null); }; ni.src = out.toDataURL("image/jpeg", 0.95);
  }
  function save() { if (!img) return; onSave(composite(img, shapes).toDataURL("image/jpeg", 0.9)); }

  return (
    <div data-fab-ignore className="fixed inset-0 z-[120] flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          {TOOLS.map((t) => (
            <button key={t.key} onClick={() => { setTool(t.key); crop.current = null; setCropDims(null); redraw(); }} title={t.label}
              className={cn("rounded-md p-1.5", tool === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}><t.icon className="h-4 w-4" /></button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} title={c} className={cn("h-6 w-6 rounded-full border", color === c ? "ring-2 ring-primary ring-offset-1" : "border-border")} style={{ background: c }} />
          ))}
        </div>
        <input type="range" min={2} max={12} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-[#315f43]" title="Brush size" />
        {tool === "crop" && cropDims && <span className="text-xs text-muted-foreground">{cropDims.w} × {cropDims.h}</span>}
        {tool === "crop" && <Button size="sm" variant="outline" onClick={applyCrop}><Crop className="h-3.5 w-3.5" /> Apply crop</Button>}
        <button onClick={() => setShapes((s) => s.slice(0, -1))} className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Undo2 className="h-3.5 w-3.5" /> Undo</button>
        <button onClick={() => { setShapes([]); crop.current = null; setCropDims(null); redraw(); }} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /> Cancel</Button>
        <Button size="sm" onClick={save}><Check className="h-4 w-4" /> Attach</Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up}
          className="mx-auto block max-w-full cursor-crosshair rounded-md border border-border shadow-lg"
          style={{ touchAction: "none", height: "auto" }} />
      </div>
    </div>
  );
}
