"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaValue } from "@/lib/marketing/content/kit";
import { cn } from "@/lib/utils";
import { MediaFrame } from "./media";

// The Life You're Building as a slowly turning 3D book (home §08).
//
// Plain three.js — @react-three/fiber is deliberately not used in this repo (its
// JSX augmentation breaks the typecheck). three and the glTF loader are only
// downloaded once the book is about to scroll into view, so they cost nothing
// to visitors who never reach it.
//
// The flat render is always underneath: it is what paints first, what stays if
// WebGL is unavailable or the model fails to load, and what visitors who prefer
// reduced motion see (a turning object is exactly the motion they opted out of).

export function Book3D({ model, fallback, className }: { model: string; fallback: MediaValue; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !model) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return; // no WebGL: the render stays
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.className = "absolute inset-0 h-full w-full";
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
      scene.add(new THREE.HemisphereLight(0xfff6e8, 0x2a2420, 1.6));
      const key = new THREE.DirectionalLight(0xffefd6, 2.4);
      key.position.set(3, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd8bd86, 1.2);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      const pivot = new THREE.Group();
      scene.add(pivot);

      const gltf = await new GLTFLoader().loadAsync(model).catch(() => null);
      if (disposed || !gltf) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      const book = gltf.scene;
      // Centre the book on its own middle and frame it: whatever units the
      // export used, the book fills the same share of the view.
      const box = new THREE.Box3().setFromObject(book);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      book.position.sub(centre);
      pivot.add(book);
      const radius = size.length() / 2;
      camera.position.set(0, radius * 0.18, radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.02);
      camera.lookAt(0, 0, 0);
      pivot.rotation.x = 0.06;

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      // Turn slowly, lingering on the cover: speed eases down as the front faces the viewer.
      let angle = -0.55;
      let last = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
        last = now;
        if (visible && !document.hidden) {
          const facing = Math.cos(angle); // 1 when the cover faces us
          angle += dt * (0.55 - 0.32 * Math.max(0, facing));
          pivot.rotation.y = angle;
          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(tick);
      };
      renderer.render(scene, camera);
      setReady(true);
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        book.traverse((obj) => {
          const mesh = obj as import("three").Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of materials) {
            for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
            m.dispose();
          }
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Load only when the book is near the viewport.
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        void start();
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(host);

    return () => {
      disposed = true;
      near.disconnect();
      cleanup();
    };
  }, [model]);

  return (
    <div ref={hostRef} className={cn("relative aspect-[4/5]", className)}>
      <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-0" : "opacity-100")}>
        <MediaFrame media={fallback} ratio="4/5" fit="contain" rounded="rounded-none" className="h-full w-full bg-transparent" sizes="420px" />
      </div>
      {ready ? <span className="sr-only">{fallback.alt}</span> : null}
    </div>
  );
}
