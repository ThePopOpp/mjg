// steward-three.js — three.js scene helpers for the Steward animation.
// Every render is a pure function of authored time T (plus a few params), so
// seeks are deterministic and the exporter sees the right frame.
// Expects window.THREE (loaded by the module script in the page helmet).
(function () {
  function mk(canvas, w, h) {
    var THREE = window.THREE;
    var r = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(w, h, false);
    r.setClearColor(0x000000, 0);
    return r;
  }
  function dot() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'); var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,0.7)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    var t = new window.THREE.CanvasTexture(c); return t;
  }
  function seeded(n) { var s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); }

  // --- Ambient particle field ------------------------------------------------
  function Particles(canvas, w, h) {
    var THREE = window.THREE; this.r = mk(canvas, w, h);
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(50, w / h, 1, 400); this.cam.position.z = 90;
    var N = this.N = 700; this.base = new Float32Array(N * 3); this.ph = new Float32Array(N * 3); this.sp = new Float32Array(N);
    var pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      this.base[i * 3] = (seeded(i * 3 + 1) - 0.5) * 220;
      this.base[i * 3 + 1] = (seeded(i * 3 + 2) - 0.5) * 120;
      this.base[i * 3 + 2] = (seeded(i * 3 + 3) - 0.5) * 90 - 10;
      this.ph[i * 3] = seeded(i * 7 + 11) * 6.283; this.ph[i * 3 + 1] = seeded(i * 7 + 13) * 6.283; this.ph[i * 3 + 2] = seeded(i * 7 + 17) * 6.283;
      this.sp[i] = 0.25 + seeded(i * 5 + 3) * 0.5;
    }
    this.geo = new THREE.BufferGeometry(); this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.mat = new THREE.PointsMaterial({ size: 2.4, map: dot(), transparent: true, depthWrite: false, sizeAttenuation: true, blending: THREE.NormalBlending, color: new THREE.Color('#c9a96e'), opacity: 0.6 });
    this.scene.add(new THREE.Points(this.geo, this.mat));
  }
  Particles.prototype.render = function (T, p) {
    var e = p.energy || 0, pos = this.geo.attributes.position.array, N = this.N;
    for (var i = 0; i < N; i++) {
      var s = this.sp[i] * (1 + e * 1.5), a = 4 + e * 10;
      pos[i * 3] = this.base[i * 3] + Math.sin(T * s + this.ph[i * 3]) * a;
      pos[i * 3 + 1] = this.base[i * 3 + 1] + Math.cos(T * s * 0.8 + this.ph[i * 3 + 1]) * a * 0.7 + T * 1.2 * (0.5 + e) % 1;
      pos[i * 3 + 2] = this.base[i * 3 + 2] + Math.sin(T * s * 0.6 + this.ph[i * 3 + 2]) * 6;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.mat.color.set(p.color || '#c9a96e'); this.mat.opacity = (p.opacity == null ? 0.6 : p.opacity) * (0.7 + e * 0.5);
    this.mat.size = 2.2 + e * 2.2;
    this.cam.position.x = Math.sin(T * 0.12) * 6; this.cam.position.y = Math.cos(T * 0.09) * 3; this.cam.lookAt(0, 0, 0);
    this.r.render(this.scene, this.cam);
  };

  // --- Steward orb -----------------------------------------------------------
  function Orb(canvas, w, h) {
    var THREE = window.THREE; this.r = mk(canvas, w, h);
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(32, w / h, 0.1, 50); this.cam.position.set(0, 0, 7);
    // soft gold halo behind the S Steps mark (the mark itself is an <img> under this canvas)
    this.coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#b88a4a'), transparent: true, opacity: 0.18 });
    this.core = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), this.coreMat); this.core.position.z = -0.5; this.scene.add(this.core);
    this.shellMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#e2ca9a'), wireframe: true, transparent: true, opacity: 0.32 });
    this.shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 1), this.shellMat); this.scene.add(this.shell);
    this.ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#c9a96e'), transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.035, 8, 96), this.ringMat); this.scene.add(this.ring);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    var key = new THREE.DirectionalLight(0xfff2d8, 1.6); key.position.set(3, 4, 5); this.scene.add(key);
    var rim = new THREE.DirectionalLight(0xc9a96e, 1.2); rim.position.set(-4, -2, -3); this.scene.add(rim);
  }
  Orb.prototype.render = function (T, p) {
    var e = p.energy || 0, mode = p.mode || 'idle';
    var rate = mode === 'thinking' ? 2.6 : mode === 'speaking' ? 1.6 : mode === 'listening' ? 1.1 : 0.6;
    var pulse = 1 + Math.sin(T * rate * 6.283) * (0.03 + e * 0.07);
    this.core.scale.setScalar(pulse * (1 + e * 0.25));
    this.coreMat.opacity = 0.1 + e * 0.3 + (mode === 'speaking' ? 0.1 : 0);
    this.shell.rotation.y = T * 0.45; this.shell.rotation.x = T * 0.2;
    this.shell.scale.setScalar(1 + e * 0.12 + (mode === 'thinking' ? Math.sin(T * 9) * 0.05 : 0));
    this.shellMat.opacity = 0.22 + e * 0.35;
    this.ring.rotation.x = 1.15 + Math.sin(T * 0.5) * 0.25; this.ring.rotation.y = T * 0.6;
    this.ringMat.opacity = 0.35 + e * 0.4;
    this.r.render(this.scene, this.cam);
  };

  window.StewardThree = { Particles: Particles, Orb: Orb };
})();
