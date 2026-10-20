import * as THREE from "three";

// The Steward animation's 3D layer.
//
// Ported from docs/steward-ai-animations/.../steward-three.js, which was
// authored against a global `window.THREE`. The behaviour is unchanged — the
// constants, the seeded distribution and the per-mode rates are all as
// authored, so what ships looks like what was approved.
//
// PLAIN three.js, IMPERATIVE, NEVER @react-three/fiber. The repo has exactly one
// other three.js surface and it carries the same warning
// (components/media-studio/book-viewer-3d.tsx): fiber augments the global
// JSX.IntrinsicElements namespace, which collapses `<Icon className=... />` to
// `never` across every unrelated file in the app. A hero animation is not worth
// breaking the type system of the whole codebase.
//
// Every render is a pure function of authored time `t` plus params, which is
// what makes the animation seekable and deterministic — and is why pausing
// off-screen is free: resume by passing the right `t`.

/** How animated the scene is, 0–1. Drives size, opacity and drift. */
export type SceneParams = {
  energy?: number;
  color?: string;
  opacity?: number;
  mode?: "idle" | "listening" | "thinking" | "speaking";
};

function createRenderer(canvas: HTMLCanvasElement, width: number, height: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  // Capped at 2: a 3x phone screen rendering 700 additive points is a battery
  // complaint, and the difference is invisible on a soft particle field.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/** A soft radial dot, drawn once and shared as the sprite for every particle. */
function createDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.7)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

/** Deterministic pseudo-random, so the field is identical on every load. */
function seeded(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** Anything the hero mounts: constructed with a canvas, rendered by time. */
export interface Layer {
  render(t: number, params: SceneParams): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

// == Ambient particle field ===================================================

const PARTICLE_COUNT = 700;

export class Particles implements Layer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly geometry = new THREE.BufferGeometry();
  private readonly material: THREE.PointsMaterial;
  private readonly texture: THREE.CanvasTexture;

  private readonly base = new Float32Array(PARTICLE_COUNT * 3);
  private readonly phase = new Float32Array(PARTICLE_COUNT * 3);
  private readonly speed = new Float32Array(PARTICLE_COUNT);

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.renderer = createRenderer(canvas, width, height);
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 400);
    this.camera.position.z = 90;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      this.base[i * 3] = (seeded(i * 3 + 1) - 0.5) * 220;
      this.base[i * 3 + 1] = (seeded(i * 3 + 2) - 0.5) * 120;
      this.base[i * 3 + 2] = (seeded(i * 3 + 3) - 0.5) * 90 - 10;
      this.phase[i * 3] = seeded(i * 7 + 11) * 6.283;
      this.phase[i * 3 + 1] = seeded(i * 7 + 13) * 6.283;
      this.phase[i * 3 + 2] = seeded(i * 7 + 17) * 6.283;
      this.speed[i] = 0.25 + seeded(i * 5 + 3) * 0.5;
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3),
    );
    this.texture = createDotTexture();
    this.material = new THREE.PointsMaterial({
      size: 2.4,
      map: this.texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
      color: new THREE.Color("#c9a96e"),
      opacity: 0.6,
    });
    this.scene.add(new THREE.Points(this.geometry, this.material));
  }

  render(t: number, params: SceneParams): void {
    const energy = params.energy ?? 0;
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const s = this.speed[i] * (1 + energy * 1.5);
      const amplitude = 4 + energy * 10;
      positions[i * 3] = this.base[i * 3] + Math.sin(t * s + this.phase[i * 3]) * amplitude;
      positions[i * 3 + 1] =
        this.base[i * 3 + 1] +
        Math.cos(t * s * 0.8 + this.phase[i * 3 + 1]) * amplitude * 0.7 +
        ((t * 1.2 * (0.5 + energy)) % 1);
      positions[i * 3 + 2] =
        this.base[i * 3 + 2] + Math.sin(t * s * 0.6 + this.phase[i * 3 + 2]) * 6;
    }
    this.geometry.attributes.position.needsUpdate = true;

    this.material.color.set(params.color ?? "#c9a96e");
    this.material.opacity = (params.opacity ?? 0.6) * (0.7 + energy * 0.5);
    this.material.size = 2.2 + energy * 2.2;

    this.camera.position.x = Math.sin(t * 0.12) * 6;
    this.camera.position.y = Math.cos(t * 0.09) * 3;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.renderer.dispose();
  }
}

// == The Steward orb ==========================================================

/**
 * The halo, wireframe shell and ring behind the Steward mark.
 *
 * The mark itself is not drawn here — in the source it is an <img> beneath the
 * canvas, so the brand asset stays a brand asset rather than becoming geometry.
 */
export class Orb implements Layer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;

  private readonly core: THREE.Mesh;
  private readonly coreMaterial: THREE.MeshBasicMaterial;
  private readonly shell: THREE.Mesh;
  private readonly shellMaterial: THREE.MeshBasicMaterial;
  private readonly ring: THREE.Mesh;
  private readonly ringMaterial: THREE.MeshBasicMaterial;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.renderer = createRenderer(canvas, width, height);
    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    this.camera.position.set(0, 0, 7);

    this.coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#b88a4a"),
      transparent: true,
      opacity: 0.18,
    });
    this.core = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), this.coreMaterial);
    this.core.position.z = -0.5;
    this.scene.add(this.core);

    this.shellMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#e2ca9a"),
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    this.shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 1), this.shellMaterial);
    this.scene.add(this.shell);

    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#c9a96e"),
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.035, 8, 96), this.ringMaterial);
    this.scene.add(this.ring);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xfff2d8, 1.6);
    key.position.set(3, 4, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9a96e, 1.2);
    rim.position.set(-4, -2, -3);
    this.scene.add(rim);
  }

  render(t: number, params: SceneParams): void {
    const energy = params.energy ?? 0;
    const mode = params.mode ?? "idle";

    // Each conversational mode has its own pulse rate. Thinking is quickest,
    // idle slowest — the same vocabulary the member app's status dot uses.
    const rate =
      mode === "thinking" ? 2.6 : mode === "speaking" ? 1.6 : mode === "listening" ? 1.1 : 0.6;

    const pulse = 1 + Math.sin(t * rate * 6.283) * (0.03 + energy * 0.07);
    this.core.scale.setScalar(pulse * (1 + energy * 0.25));
    this.coreMaterial.opacity = 0.1 + energy * 0.3 + (mode === "speaking" ? 0.1 : 0);

    this.shell.rotation.y = t * 0.45;
    this.shell.rotation.x = t * 0.2;
    this.shell.scale.setScalar(
      1 + energy * 0.12 + (mode === "thinking" ? Math.sin(t * 9) * 0.05 : 0),
    );
    this.shellMaterial.opacity = 0.22 + energy * 0.35;

    this.ring.rotation.x = 1.15 + Math.sin(t * 0.5) * 0.25;
    this.ring.rotation.y = t * 0.6;
    this.ringMaterial.opacity = 0.35 + energy * 0.4;

    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    this.core.geometry.dispose();
    this.coreMaterial.dispose();
    this.shell.geometry.dispose();
    this.shellMaterial.dispose();
    this.ring.geometry.dispose();
    this.ringMaterial.dispose();
    this.renderer.dispose();
  }
}
