"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/books/repository";
import { buildBlankTexture, buildCoverTexture, buildPageTexture, type BookTheme } from "./book-page-texture";

// Deliberately plain three.js rather than @react-three/fiber: fiber augments the global
// JSX.IntrinsicElements namespace, which collapses `<Icon className=... />` props to `never`
// across every unrelated file in the app. The scene is small and self-contained, so an
// imperative renderer is both cheaper and better isolated.

// Page proportions in world units (~1:1.4 trade book).
const PAGE_W = 1.4;
const PAGE_H = 1.96;
// Columns across the leaf. This is the three.js equivalent of the sketchbook's "chain of
// nested strips whose tangent sweeps through an arc" — more columns, smoother curl.
const SEGMENTS = 28;
// How far the leaf bows mid-turn, in radians of extra tangent sweep.
const BEND = 0.62;
// Per-sheet z spacing so stacked leaves don't z-fight.
const SHEET_THICKNESS = 0.0042;

type Sheet = {
  geometry: THREE.PlaneGeometry;
  columns: Uint8Array;
  front: THREE.Mesh;
  back: THREE.Mesh;
  frontTex: THREE.Texture;
  backTex: THREE.Texture;
  lastT: number;
};

function buildSheetGeometry() {
  const geo = new THREE.PlaneGeometry(PAGE_W, PAGE_H, SEGMENTS, 1);
  // Move the hinge to x = 0 so the leaf runs from the spine out to +x.
  geo.translate(PAGE_W / 2, 0, 0);
  return geo;
}

/**
 * Deform one leaf to a turn progress t (0 = flat right, 1 = flat left).
 *
 * Integrates the tangent along the leaf: phi(s) = turn + bend*sin(pi*s). At t=0 phi is 0 and the
 * leaf lies flat to the right; at t=1 phi is pi and it lies flat to the left; in between the
 * extra bend term bows it toward the viewer the way real paper does.
 */
function deformSheet(sheet: Sheet, t: number, index: number, sheetCount: number, arc: { xs: Float32Array; zs: Float32Array }) {
  const A = Math.PI * t;
  const B = BEND * Math.sin(Math.PI * t);
  const du = 1 / SEGMENTS;
  let x = 0;
  let z = 0;
  arc.xs[0] = 0;
  arc.zs[0] = 0;
  for (let i = 1; i <= SEGMENTS; i += 1) {
    const s = (i - 0.5) * du;
    const phi = A + B * Math.sin(Math.PI * s);
    x += Math.cos(phi) * du * PAGE_W;
    z += Math.sin(phi) * du * PAGE_W;
    arc.xs[i] = x;
    arc.zs[i] = z;
  }

  // Rest height in the stack: unturned leaves pile up on the right, turned ones on the left,
  // and the offset crosses over smoothly as the leaf sweeps.
  const zOffset = THREE.MathUtils.lerp(SHEET_THICKNESS * (sheetCount - index), SHEET_THICKNESS * (index + 1), t);

  const pos = sheet.geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const c = sheet.columns[i];
    pos.setX(i, arc.xs[c]);
    pos.setZ(i, arc.zs[c] + zOffset);
  }
  pos.needsUpdate = true;
  sheet.geometry.computeVertexNormals();
  sheet.geometry.computeBoundingSphere();
}

export function BookViewer3D({ book, className }: { book: Book; className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [pageLabel, setPageLabel] = useState(0);
  const [sheetCount, setSheetCount] = useState(0);

  // Turn state as a single float: the integer part is how many leaves are turned, the fraction
  // is the leaf currently in flight. Kept in refs so dragging never triggers a React render.
  const turn = useRef({ value: 0, target: 0, dragging: false });
  const pointer = useRef({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; base: number } | null>(null);
  const sheetsRef = useRef<Sheet[]>([]);

  const settle = useCallback((next: number) => {
    const count = sheetsRef.current.length;
    const clamped = THREE.MathUtils.clamp(next, 0, count);
    turn.current.target = clamped;
    setPageLabel(Math.round(clamped));
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.25, 4.35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8ac97, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(2.2, 3.4, 4.2);
    scene.add(key);
    const warm = new THREE.DirectionalLight(0xc9aa70, 0.35);
    warm.position.set(-3, 1.5, 2);
    scene.add(warm);

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const arc = { xs: new Float32Array(SEGMENTS + 1), zs: new Float32Array(SEGMENTS + 1) };

    // Build every page texture, then a leaf per pair of faces.
    (async () => {
      const theme: BookTheme = {
        pageColor: book.pageColor,
        accentColor: book.accentColor,
        coverColor: book.coverColor,
      };

      const faces: THREE.Texture[] = [];
      faces.push(await buildCoverTexture(book.title, book.subtitle, theme, book.coverImageUrl, renderer));
      for (let i = 0; i < book.pages.length; i += 1) {
        const page = book.pages[i];
        faces.push(
          await buildPageTexture(
            { heading: page.heading, body: page.body, imageUrl: page.imageUrl, pageNumber: i + 1 },
            theme,
            renderer,
          ),
        );
      }
      // Back cover, then pad to an even face count so every leaf has two sides.
      faces.push(buildBlankTexture(theme, renderer));
      if (faces.length % 2 !== 0) faces.push(buildBlankTexture(theme, renderer));

      if (disposed) {
        for (const f of faces) f.dispose();
        return;
      }

      const sheets: Sheet[] = [];
      for (let i = 0; i < faces.length; i += 2) {
        const frontTex = faces[i];
        const backTex = faces[i + 1];
        // A BackSide plane shows its texture mirrored; flip u so the verso reads correctly.
        backTex.wrapS = THREE.RepeatWrapping;
        backTex.repeat.x = -1;
        backTex.offset.x = 1;
        backTex.needsUpdate = true;

        const geometry = buildSheetGeometry();
        // Precompute each vertex's column so the per-frame loop is a table lookup.
        const pos = geometry.attributes.position;
        const columns = new Uint8Array(pos.count);
        for (let v = 0; v < pos.count; v += 1) {
          columns[v] = Math.round((pos.getX(v) / PAGE_W) * SEGMENTS);
        }

        const front = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ map: frontTex, side: THREE.FrontSide, roughness: 0.92, metalness: 0.02 }),
        );
        const back = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({ map: backTex, side: THREE.BackSide, roughness: 0.92, metalness: 0.02 }),
        );
        scene.add(front, back);

        const sheet: Sheet = { geometry, columns, front, back, frontTex, backTex, lastT: -1 };
        deformSheet(sheet, 0, sheets.length, faces.length / 2, arc);
        sheets.push(sheet);
      }

      sheetsRef.current = sheets;
      setSheetCount(sheets.length);
      setReady(true);
    })();

    function animate() {
      frame = requestAnimationFrame(animate);
      const state = turn.current;
      if (!state.dragging) {
        // Ease toward the settled page: snappy enough to feel physical, slow enough to read.
        state.value += (state.target - state.value) * 0.14;
        if (Math.abs(state.target - state.value) < 0.0008) state.value = state.target;
      }

      const sheets = sheetsRef.current;
      for (let i = 0; i < sheets.length; i += 1) {
        const sheet = sheets[i];
        const t = THREE.MathUtils.clamp(state.value - i, 0, 1);
        // Nothing moved and this leaf is at rest — skip the rebuild entirely.
        if (Math.abs(t - sheet.lastT) < 0.0005) continue;
        sheet.lastT = t;
        deformSheet(sheet, t, i, sheets.length, arc);
      }

      // Cursor parallax: the whole book leans very slightly toward the pointer.
      camera.position.x += (pointer.current.x * 0.45 - camera.position.x) * 0.05;
      camera.position.y += (0.25 + pointer.current.y * 0.35 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const sheet of sheetsRef.current) {
        sheet.geometry.dispose();
        (sheet.front.material as THREE.Material).dispose();
        (sheet.back.material as THREE.Material).dispose();
        sheet.frontTex.dispose();
        sheet.backTex.dispose();
      }
      sheetsRef.current = [];
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // Rebuild the whole scene when the book's content or styling changes.
  }, [book.id, book.title, book.subtitle, book.coverImageUrl, book.pages, book.pageColor, book.accentColor, book.coverColor]);

  // Reset the turn state whenever a different book is shown.
  useEffect(() => {
    turn.current = { value: 0, target: 0, dragging: false };
    setPageLabel(0);
  }, [book.id]);

  function onPointerDown(e: React.PointerEvent) {
    if (!sheetsRef.current.length) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStart.current = { x: e.clientX, base: turn.current.value };
    turn.current.dragging = true;
  }

  function onPointerMove(e: React.PointerEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    };

    if (!dragStart.current) return;
    // Dragging leftward turns pages forward, the way you'd sweep a real leaf over.
    const delta = (dragStart.current.x - e.clientX) / (rect.width * 0.55);
    turn.current.value = THREE.MathUtils.clamp(dragStart.current.base + delta, 0, sheetsRef.current.length);
  }

  function endDrag() {
    if (!dragStart.current) return;
    dragStart.current = null;
    turn.current.dragging = false;
    settle(Math.round(turn.current.value));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      settle(turn.current.target + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      settle(turn.current.target - 1);
    }
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label={`${book.title} — 3D page-turning preview`}
        className="relative aspect-[4/3] w-full cursor-grab overflow-hidden rounded-lg border bg-gradient-to-b from-[#1a1a18] to-[#0b0b0a] outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <div ref={mountRef} className="absolute inset-0" />

        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            Rendering pages…
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center pb-3">
            <span className="rounded-full bg-black/45 px-3 py-1 text-xs text-white/70 backdrop-blur">
              Drag to turn · arrow keys also work
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => settle(pageLabel - 1)} disabled={pageLabel <= 0}>
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <span className="min-w-24 text-center text-sm text-muted-foreground">
          {pageLabel === 0 ? "Cover" : `Spread ${pageLabel} / ${Math.max(sheetCount, 1)}`}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => settle(pageLabel + 1)} disabled={pageLabel >= sheetCount}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => settle(0)} disabled={pageLabel === 0}>
          <RotateCcw className="h-4 w-4" />
          Close book
        </Button>
      </div>
    </div>
  );
}

export default BookViewer3D;
