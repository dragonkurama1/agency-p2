"use client";

import { useEffect, useRef } from "react";

/*
 * ─── Planet.tsx ─────────────────────────────────────────────────────────────
 * Real Three.js PBR sphere — SphereGeometry + MeshPhysicalMaterial with the
 * full 6-map texture set (base color, normal, roughness, height/displacement,
 * ambient occlusion, atmosphere glow). The surface itself rotates on the
 * sphere; nothing here is a rotated 2D image. Rotation is driven entirely by
 * scroll position via GSAP ScrollTrigger — no idle/auto-spin. The camera
 * never moves and there are no orbit/drag controls.
 *
 * Folder structure (existing project architecture, nothing new added):
 *   components/marketing/Planet.tsx   ← this file
 *   public/textures/planet/*.webp     ← the 6 PBR maps (compressed, seamless)
 *   app/(site)/layout.tsx             ← mounts <Planet /> globally
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ─── Tuning constants ──────────────────────────────────────────────────── */
const SPHERE_RADIUS   = 4;
const CAMERA_Z        = 10.5;
const FOV             = 44;          // degrees
const LERP_FACTOR     = 0.08;        // scroll-rotation smoothing (brief: 0.08)
const NORMAL_SCALE    = 1.8;         // normal map strength
const ATM_SCALE       = 1.02;        // atmosphere sphere radius multiplier
const ATM_OPACITY_MIN = 0.35;
const ATM_OPACITY_MAX = 0.6;
const PIXEL_RATIO_CAP = 2;           // GPU memory guard
const TRANSLATE_X_PCT = 38;          // % of canvas pushed off-screen to the right

/* Brand colours the lighting rig is tuned against */
const BRAND_VIOLET = 0x7c3aed;
const BRAND_DEEP    = 0x200e3b;
const BRAND_BLUE    = 0x3b82f6;

/* Per-tier quality — desktop gets the full 512-segment sphere requested;
 * tablet and mobile step down geometry density and drop displacement to
 * keep 60fps on weaker GPUs without changing how the planet looks at a
 * glance. */
type Tier = "mobile" | "tablet" | "desktop";

function getTier(width: number): Tier {
  if (width < 768) return "mobile";
  if (width < 1280) return "tablet";
  return "desktop";
}

const SEGMENTS: Record<Tier, number> = {
  mobile:  96,
  tablet:  256,
  desktop: 512,
};

const DISPLACEMENT_SCALE: Record<Tier, number> = {
  mobile:  0,      // no displacement on mobile — flat-shaded relief via normal map only
  tablet:  0.09,
  desktop: 0.12,
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export function Planet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Deferred disposal refs ────────────────────────────────────────── */
    let mounted            = true;
    let rafId               = 0;
    const toDispose: Array<{ dispose(): void }> = [];
    let killScrollTrigger:  (() => void) | null = null;
    let killResizeObserver: (() => void) | null = null;
    let disposeRenderer:    (() => void) | null = null;

    /* ── Async bootstrap ───────────────────────────────────────────────── */
    async function init() {
      /* Dynamic imports — Three.js and GSAP land only in the browser bundle */
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
        antialias:       window.devicePixelRatio < 2, // skip AA when DPR≥2 (already sharp)
        alpha:           true,
        powerPreference: "high-performance",
        precision:       "highp", // high-precision normals, per spec
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
      renderer.outputColorSpace    = THREE.SRGBColorSpace;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const W = canvas.offsetWidth  || 800;
      const H = canvas.offsetHeight || 800;
      renderer.setSize(W, H, false); // false = don't override CSS size

      disposeRenderer = () => renderer.dispose();

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

      /* ─── Scene / Camera — camera is fixed for the whole lifetime ─────── */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
      camera.position.set(0, 0, CAMERA_Z);
      camera.lookAt(0, 0, 0);
      /* No OrbitControls / drag listeners are attached anywhere — the
       * camera transform is set once above and never touched again. */

      /* Tier resolved once at boot — decides both geometry density (below)
       * and which textures are worth downloading at all. */
      const tier = getTier(window.innerWidth);
      const wantsDisplacement = tier !== "mobile";

      /* ─── Texture loading (lazy — only after idle, see bottom) ────────── */
      const loader = new THREE.TextureLoader();
      const [colorTex, normalTex, roughTex, dispTex, aoTex, atmTex] =
        await Promise.all([
          loader.loadAsync("/textures/planet/color.webp"),
          loader.loadAsync("/textures/planet/normal.webp"),
          loader.loadAsync("/textures/planet/roughness.webp"),
          wantsDisplacement ? loader.loadAsync("/textures/planet/displacement.webp") : Promise.resolve(null),
          loader.loadAsync("/textures/planet/ao.webp"),
          loader.loadAsync("/textures/planet/atmosphere.webp"),
        ]);

      if (!mounted) return;

      /* Base color is perceptual (sRGB); every other map is linear data */
      colorTex.colorSpace = THREE.SRGBColorSpace;

      /*
       * Horizontal wrapping — the equirectangular maps meet at the sphere's
       * longitude seam. The source textures were pre-processed with a
       * cross-faded edge band so the seam is invisible; RepeatWrapping lets
       * mipmap filtering sample across it instead of clamping (which would
       * reintroduce a visible vertical line / UV artifact).
       */
      [colorTex, normalTex, roughTex, dispTex, aoTex]
        .filter((t): t is InstanceType<typeof THREE.Texture> => t !== null)
        .forEach((t) => {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.ClampToEdgeWrapping; // poles: clamp, never wrap vertically
          t.anisotropy = maxAnisotropy;
          t.generateMipmaps = true;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
        });

      /* Register all loaded textures for disposal */
      [colorTex, normalTex, roughTex, dispTex, aoTex, atmTex]
        .filter((t): t is InstanceType<typeof THREE.Texture> => t !== null)
        .forEach((t) => toDispose.push(t));

      /* ─── Planet geometry / material ───────────────────────────────────
       * Tier was resolved above (before texture loading); a full page
       * reload (not just a resize) is required to change tiers, which
       * avoids rebuilding a 512-segment geometry mid-session on an
       * orientation change. */
      const segments = SEGMENTS[tier];

      const geo = new THREE.SphereGeometry(SPHERE_RADIUS, segments, segments);

      /*
       * aoMap needs its own UV channel. In Three.js ≥ r152 the second UV
       * set is stored as 'uv1' (previously 'uv2'). We copy the default UVs.
       */
      geo.setAttribute("uv1", geo.attributes.uv);

      const mat = new THREE.MeshPhysicalMaterial({
        map:               colorTex,
        normalMap:         normalTex,
        normalScale:       new THREE.Vector2(NORMAL_SCALE, NORMAL_SCALE),
        roughnessMap:      roughTex,
        roughness:         1.0,
        metalness:         0.0,
        displacementMap:   dispTex, // null on mobile — wantsDisplacement above
        displacementScale: DISPLACEMENT_SCALE[tier],
        aoMap:             aoTex,
        aoMapIntensity:    1.4,
        clearcoat:         0,     // rocky surface — no clearcoat sheen
        reflectivity:      0.12,  // faint physically-based sheen on lit ridges
        envMapIntensity:   1.0,
      });

      /* aoMap samples from uv1 — declared on the texture, not the material */
      aoTex.channel = 1;

      const planet = new THREE.Mesh(geo, mat);
      scene.add(planet);
      toDispose.push(geo, mat);

      /* ─── Atmosphere shell ─────────────────────────────────────────────
       * Second sphere, slightly larger, additive-blended, back-face only,
       * so it reads as a soft glow rim rather than a solid shell. */
      const atmGeo = new THREE.SphereGeometry(SPHERE_RADIUS * ATM_SCALE, 96, 96);
      const atmOpacity = tier === "mobile" ? ATM_OPACITY_MIN : (ATM_OPACITY_MIN + ATM_OPACITY_MAX) / 2;
      const atmMat = new THREE.MeshBasicMaterial({
        map:         atmTex,
        transparent: true,
        opacity:     atmOpacity,
        blending:    THREE.AdditiveBlending,
        side:        THREE.BackSide,
        depthWrite:  false,
      });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      scene.add(atm);
      toDispose.push(atmGeo, atmMat);

      /* ─── Cinematic lighting rig — tuned to brand violet/deep-indigo ───
       * Ambient + directional key preserve crater detail without blowing
       * out highlights; hemisphere adds sky/ground colour separation;
       * the purple rim + blue secondary give the limb its glow without
       * washing out the displaced surface. */

      // Soft fill — keeps the dark side readable, never flat black
      const ambientLight = new THREE.AmbientLight(BRAND_DEEP, 0.4);
      scene.add(ambientLight);

      // Sky/ground colour split — cheap, adds a lot of perceived depth
      const hemiLight = new THREE.HemisphereLight(0x9d7fe8, BRAND_DEEP, 0.55);
      scene.add(hemiLight);

      // Key light — "sun", upper-left, casts the primary crater shadows
      const keyLight = new THREE.DirectionalLight(0xfff0e0, 2.6);
      keyLight.position.set(-4, 3, 5);
      scene.add(keyLight);

      // Blue secondary — opposite side, cool fill so shadows aren't pure black
      const blueLight = new THREE.DirectionalLight(BRAND_BLUE, 0.35);
      blueLight.position.set(5, -2, -4);
      scene.add(blueLight);

      // Purple rim light — brand-colour glow along the limb, from behind
      const rimLight = new THREE.PointLight(BRAND_VIOLET, 2.2, 22);
      rimLight.position.set(2.5, 3, -7);
      scene.add(rimLight);

      /* ─── GSAP ScrollTrigger — scroll is the only source of rotation ───
       * progress 0→1 maps to rotation 0→2π. Scrolling up decreases
       * progress and rotates the planet backward automatically — there is
       * no separate "reverse" branch needed, and no idle/auto-spin ever
       * runs. Desktop + tablet only; skip entirely under reduced-motion.
       */
      let targetRY  = 0;
      let currentRY = 0;

      if (!prefersReduced) {
        /*
         * No trigger element: <html> has height:100% (shorter than the
         * page), so element-based start/end would collapse to zero range.
         * An absolute 0 → maxScroll range tracks the full page instead.
         */
        const st = ScrollTrigger.create({
          start:    0,
          end:      () => ScrollTrigger.maxScroll(window),
          scrub:    true, // brief: scrub: true (immediate scroll-coupling; lerp below adds the smoothing)
          onUpdate: (self) => {
            targetRY = self.progress * Math.PI * 2; // 0 → full 360°
          },
        });
        ScrollTrigger.refresh();
        killScrollTrigger = () => st.kill();
      }

      /* ─── Render loop — requestAnimationFrame, lerped rotation ────────── */
      function tick() {
        if (!mounted) return;
        rafId = requestAnimationFrame(tick);

        // Exponential lerp: smooths abrupt scroll deltas into fluid motion
        currentRY += (targetRY - currentRY) * LERP_FACTOR;
        planet.rotation.y = currentRY;
        // Atmosphere lags very slightly — adds perceptual depth/parallax
        atm.rotation.y    = currentRY * 0.92;

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);

      /* ─── ResizeObserver — keep canvas / camera in sync ────────────────
       * Only resizes the renderer/camera aspect; never touches segments
       * or reloads textures, so this stays cheap on every resize event. */
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

    /*
     * Defer the heavy bootstrap (module import, texture decode, geometry
     * build, GPU upload) until the browser is idle, so it never competes
     * with the hero's first paint / LCP. Falls back to a short timeout on
     * browsers without requestIdleCallback (Safari).
     */
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?:  (handle: number) => void;
    };
    const idleWindow = window as IdleWindow;
    let idleHandle    = 0;
    let timeoutHandle = 0;

    const run = () => {
      init().catch((err) => {
        if (mounted) console.error("[Planet] init failed:", err);
      });
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleHandle = idleWindow.requestIdleCallback(run, { timeout: 2000 });
    } else {
      timeoutHandle = window.setTimeout(run, 200);
    }

    /* ── Cleanup — full resource disposal, no leaks across route changes ── */
    return () => {
      mounted = false;
      if (idleHandle && idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleHandle);
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
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
   *   · translateX(TRANSLATE_X_PCT%) pushes it ~40% off-screen to the right
   *   · pointer-events: none — never blocks page interaction/content
   *
   * The z-index (-1) matches the star canvas. Because <Planet> is rendered
   * BEFORE <SpaceBackground> in the layout, the stars canvas (later in DOM)
   * paints on top of this canvas — stars appear in front of the planet.
   * The existing site background (#space-bg) is untouched.
   */
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        right:         0,
        top:           "50%",
        transform:     `translateY(-50%) translateX(${TRANSLATE_X_PCT}%)`,
        pointerEvents: "none",
        zIndex:        -1,
        /* Square — large enough to feel gigantic in the viewport */
        width:         "min(112vh, 96vw)",
        height:        "min(112vh, 96vw)",
      }}
    />
  );
}
