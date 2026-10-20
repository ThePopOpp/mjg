"use client";

import * as React from "react";
import { Orb, Particles, type Layer, type SceneParams } from "./steward-three";

// The live hero layer: a drifting gold particle field with the Steward orb at
// its centre.
//
// Three things this does that a naive canvas component does not, each because
// of a specific failure rather than general tidiness:
//
//   1. STOPS WHEN NOT VISIBLE. 700 additive points re-uploaded every frame in a
//      background tab is a battery complaint and a fan noise complaint. Paused
//      on IntersectionObserver and on visibilitychange.
//   2. HONOURS prefers-reduced-motion. No canvas is created at all — not a
//      stopped one. Someone who asked the operating system for less motion
//      should not be served a WebGL context.
//   3. DISPOSES EVERYTHING. Geometries, materials, textures and the renderer.
//      Next keeps the page alive across client navigations, so a leaked context
//      survives until the tab is closed, and browsers cap them at ~16.
//
// Time is accumulated rather than taken from the clock, so a pause does not
// teleport the animation forward when it resumes.

type Props = {
  /** 0–1. How alive the field is. */
  energy?: number;
  mode?: SceneParams["mode"];
  className?: string;
};

export function StewardHeroScene({ energy = 0.35, mode = "idle", className }: Props) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const particlesCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const orbCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = React.useState<boolean | null>(null);

  // Read on the client only, and follow changes — someone can toggle it while
  // the page is open.
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Params change between renders; the animation loop reads them from a ref so
  // it never has to be torn down and rebuilt to pick up a new value.
  const paramsRef = React.useRef<SceneParams>({ energy, mode });
  paramsRef.current = { energy, mode };

  React.useEffect(() => {
    if (reducedMotion !== false) return;

    const host = hostRef.current;
    const particlesCanvas = particlesCanvasRef.current;
    const orbCanvas = orbCanvasRef.current;
    if (!host || !particlesCanvas || !orbCanvas) return;

    const size = () => ({
      width: Math.max(host.clientWidth, 1),
      height: Math.max(host.clientHeight, 1),
    });

    let layers: Layer[];
    try {
      const { width, height } = size();
      layers = [new Particles(particlesCanvas, width, height), new Orb(orbCanvas, width, height)];
    } catch {
      // WebGL can be unavailable or blocked. The hero still has its headline and
      // its background; it simply does not animate.
      return;
    }

    let frame = 0;
    let elapsed = 0;
    let last = performance.now();
    let visible = true;
    let onScreen = true;

    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed += delta;
      for (const layer of layers) layer.render(elapsed, paramsRef.current);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      // Reset the clock so the paused interval is not replayed as a jump.
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (visible && onScreen ? start() : stop());

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(host);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resize = new ResizeObserver(() => {
      const { width, height } = size();
      for (const layer of layers) layer.resize(width, height);
    });
    resize.observe(host);

    sync();

    return () => {
      stop();
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      for (const layer of layers) layer.dispose();
    };
  }, [reducedMotion]);

  return (
    <div ref={hostRef} aria-hidden className={className}>
      {/* Both canvases are decorative. The hero's meaning is in its text, which
          sits above this in the DOM and is what a screen reader gets. */}
      {reducedMotion === false ? (
        <>
          <canvas ref={particlesCanvasRef} className="absolute inset-0 h-full w-full" />
          {/* Sits low and dimmed rather than centred. At full strength behind
              the headline the wireframe shell reads as clutter crossing the
              words; down here it anchors the composition under the buttons. */}
          <canvas
            ref={orbCanvasRef}
            className="absolute left-1/2 top-[72%] h-[clamp(15rem,30vw,24rem)] w-[clamp(15rem,30vw,24rem)] -translate-x-1/2 -translate-y-1/2 opacity-60"
          />
        </>
      ) : (
        // The still equivalent: the same gold bloom the animation settles into.
        <div
          className="absolute left-1/2 top-[72%] h-[clamp(15rem,30vw,24rem)] w-[clamp(15rem,30vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201,169,110,0.22) 0%, rgba(184,138,74,0.10) 45%, rgba(0,0,0,0) 70%)",
          }}
        />
      )}
    </div>
  );
}

export default StewardHeroScene;
