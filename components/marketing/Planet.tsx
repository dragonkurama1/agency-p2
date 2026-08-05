"use client";

import { useEffect, useRef } from "react";

/* ─── Tuning constants — adjust to taste ────────────────────────────────── */
const SPHERE_RADIUS       = 4;
const CAMERA_Z            = 10.5;
const FOV                 = 44;           // degrees
const LERP_FACTOR         = 0.055;        // rotation smoothing  (lower = smoother)
const NORMAL_SCALE        = 1.8;          // normal map strength
const DISPLACEMENT_SCALE  = 0.14;         // surface relief depth
const ATM_SCALE           = 1.045;        // atmosphere sphere radius multiplier
const ATM_OPACITY         = 0.65;
const PIXEL_RATIO_CAP     = 2;            // GPU memory guard
const TRANSLATE_X_PCT     = 38;           // % of canvas pushed off-screen to the right

/* ─── Component ─────────────────────────────────────────────────────────── */
export function Planet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    /* Skip entirely on small screens */
    if (window.innerWidth < 768) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Deferred disposal refs ──────────────────────────────────────────── */
    let mounted            = true;
    let rafId              = 0;
    const toDispose: Array<{ dispose(): void }> = [];
    let killScrollTrigger: (() => void) | null  = null;
    let killResizeObserver: (() => void) | null = null;
    let disposeRenderer:    (() => void) | null = null;

    /* ── Async bootstrap ─────────────────────────────────────────────────── */
    async function init() {
      /* Dynamic imports — Three.js and GSAP land only in the browser bundle  */
      const [
        THREE,
        { default: gsap },
        { ScrollTrigger },
      ] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (!mounted || !canvas) return;
      gsap.registerPlugin(ScrollTrigger);

      /* ─── Renderer ───────────────────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: window.devicePixelRatio < 2, // skip AA when DPR≥2 (already sharp)
        alpha:     true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
      renderer.outputColorSpace    = THREE.SRGBColorSpace;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const W = canvas.offsetWidth  || 800;
      const H = canvas.offsetHeight || 800;
      renderer.setSize(W, H, false); // false = don't override CSS size

      disposeRenderer = () => renderer.dispose();

      /* ─── Scene / Camera ─────────────────────────────────────────────── */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
      camera.position.set(0, 0, CAMERA_Z);

      /* ─── Texture loading ────────────────────────────────────────────── */
      const loader = new THREE.TextureLoader();
      const [colorTex, normalTex, roughTex, dispTex, aoTex, atmTex] =
        await Promise.all([
          loader.loadAsync("/textures/planet/color.png"),
          loader.loadAsync("/textures/planet/normal.png"),
          loader.loadAsync("/textures/planet/roughness.png"),
          loader.loadAsync("/textures/planet/displacement.png"),
          loader.loadAsync("/textures/planet/ao.png"),
          loader.loadAsync("/textures/planet/atmosphere.png"),
        ]);

      if (!mounted) return;

      /* Color map is perceptual (sRGB); all others are linear data maps */
      colorTex.colorSpace = THREE.SRGBColorSpace;

      /* Register all textures for disposal */
      [colorTex, normalTex, roughTex, dispTex, aoTex, atmTex].forEach(t =>
        toDispose.push(t),
      );

      /* ─── Planet geometry / material ─────────────────────────────────── */
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1280;
      const segments = isMobile ? 64 : isTablet ? 128 : 256;

      const geo = new THREE.SphereGeometry(SPHERE_RADIUS, segments, segments);

      /*
       * aoMap needs its own UV channel.  In Three.js ≥ r152 the second UV set
       * is stored as 'uv1' (previously 'uv2').  We copy the default UVs there.
       */
      geo.setAttribute("uv1", geo.attributes.uv);

      const mat = new THREE.MeshStandardMaterial({
        map:               colorTex,
        normalMap:         normalTex,
        normalScale:       new THREE.Vector2(NORMAL_SCALE, NORMAL_SCALE),
        roughnessMap:      roughTex,
        roughness:         1.0,
        metalness:         0.0,
        displacementMap:   isMobile ? null : dispTex,
        displacementScale: DISPLACEMENT_SCALE,
        aoMap:             aoTex,
        aoMapIntensity:    1.4,
        aoMapChannel:      1,          // matches the uv1 attribute above
      });

      const planet = new THREE.Mesh(geo, mat);
      scene.add(planet);
      toDispose.push(geo, mat);

      /* ─── Atmosphere shell ───────────────────────────────────────────── */
      const atmGeo = new THREE.SphereGeometry(SPHERE_RADIUS * ATM_SCALE, 64, 64);
      const atmMat = new THREE.MeshBasicMaterial({
        map:         atmTex,
        transparent: true,
        opacity:     ATM_OPACITY,
        blending:    THREE.AdditiveBlending,
        side:        THREE.BackSide,
        depthWrite:  false,
      });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      scene.add(atm);
      toDispose.push(atmGeo, atmMat);

      /* ─── Lighting ───────────────────────────────────────────────────── */

      // Soft fill for the dark side
      const ambientLight = new THREE.AmbientLight(0x200e3b, 0.35);
      scene.add(ambientLight);

      // Key light — "sun", upper-left of scene
      const keyLight = new THREE.DirectionalLight(0xfff0e0, 2.8);
      keyLight.position.set(-4, 3, 5);
      scene.add(keyLight);

      // Weak opposite fill — warms shadows slightly
      const fillLight = new THREE.DirectionalLight(0x8855cc, 0.22);
      fillLight.position.set(5, -2, -4);
      scene.add(fillLight);

      // Rim/atmosphere halo — violet brand colour, from behind
      const rimLight = new THREE.PointLight(0x7c3aed, 2.4, 22);
      rimLight.position.set(2.5, 3, -7);
      scene.add(rimLight);

      /* ─── GSAP ScrollTrigger ─────────────────────────────────────────── */
      let targetRY  = 0;
      let currentRY = 0;

      if (!prefersReduced) {
        const st = ScrollTrigger.create({
          trigger:  document.documentElement,
          start:    "top top",
          end:      "bottom bottom",
          scrub:    1.2,
          onUpdate: (self) => {
            targetRY = self.progress * Math.PI * 2; // 0 → full 360°
          },
        });
        killScrollTrigger = () => st.kill();
      }

      /* ─── Render loop ────────────────────────────────────────────────── */
      function tick() {
        if (!mounted) return;
        rafId = requestAnimationFrame(tick);

        // Exponential lerp keeps motion smooth and responsive
        currentRY += (targetRY - currentRY) * LERP_FACTOR;
        planet.rotation.y = currentRY;
        // Atmosphere lags very slightly — adds perceptual depth
        atm.rotation.y    = currentRY * 0.92;

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);

      /* ─── ResizeObserver — keep canvas / camera in sync ─────────────── */
      const ro = new ResizeObserver(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(canvas);
      killResizeObserver = () => ro.disconnect();
    }

    init().catch((err) => {
      if (mounted) console.error("[Planet] init failed:", err);
    });

    /* ── Cleanup ─────────────────────────────────────────────────────────── */
    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      killScrollTrigger?.();
      killResizeObserver?.();
      toDispose.forEach((item) => item.dispose());
      disposeRenderer?.();
    };
  }, []);

  /*
   * Canvas positioning:
   *   · Fixed to the right, vertically centred
   *   · translateY(-50%) centres it on the Y axis
   *   · translateX(TRANSLATE_X_PCT%) pushes it partially off-screen to the right
   *   · Tailwind "hidden md:block" hides on mobile, shows on tablet+
   *
   * The z-index (-1) matches the star canvas.  Because <Planet> is rendered
   * BEFORE <SpaceBackground> in the layout, the stars canvas (later in DOM)
   * paints on top of this canvas — stars appear in front of the planet.
   */
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="hidden md:block"
      style={{
        position:      "fixed",
        right:         0,
        top:           "50%",
        transform:     `translateY(-50%) translateX(${TRANSLATE_X_PCT}%)`,
        pointerEvents: "none",
        zIndex:        -1,
        /* Square — large enough to feel massive in the viewport */
        width:         "min(112vh, 96vw)",
        height:        "min(112vh, 96vw)",
      }}
    />
  );
}
