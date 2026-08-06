"use client";

import { useEffect, useRef } from "react";
import { detectQualityProfile } from "./planet/capabilities";
import { loadKTX2Textures } from "./planet/ktx2-loader";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./planet/shaders";
import { createBloomComposer } from "./planet/post-processing";

/*
 * ─── Planet.tsx — Phase 3: visual system ────────────────────────────────
 * Builds on the Phase 2 foundation (device-capability profile, KTX2
 * loading, world-space frustum sizing — all unchanged): the sphere now
 * uses a custom ShaderMaterial that blends crystal → lava → sun as
 * uProgress (0→1) rises, driven by scroll via GSAP ScrollTrigger mapping
 * the whole document height to uProgress — same one-progress-value
 * narrative as before. An additive atmosphere shell adds a soft glow
 * without needing a post-processing pass.
 *
 * Bloom (see ./planet/post-processing.ts) runs on top of this, gated by
 * profile.postFX — mid/high device profiles only, so weaker devices never
 * construct a composer or pay for the extra passes.
 *
 * Deliberately still not in this phase: the particle burst and the
 * site-wide colour sync (--glow-violet/--glow-blue) that the old system
 * drove — those are Phase 4.
 */

const SPHERE_RADIUS = 4;
const CAMERA_Z = 10.5;
const FOV = 44;

/* ─── Sizing/centring — one formula, continuous across every aspect ratio,
 * no mobile/desktop branch ────────────────────────────────────────────────
 * SIZE_FRAC_HEIGHT is the primary target: the sphere is sized to this
 * fraction of the viewport's HEIGHT on every device. SIZE_FRAC_WIDTH_CAP is
 * only a safety ceiling for unusually narrow/tall viewports, so the sphere
 * can never overflow the width — it is deliberately generous (0.85, not a
 * tight fraction), because on portrait screens frustum WIDTH is naturally
 * much smaller than frustum HEIGHT: a tight width-based cap there was the
 * actual bug (min(widthFrac, heightCap) let the small width term win on
 * every portrait viewport, sizing the sphere to ~20% of viewport height
 * instead of the intended ~60% — 3x smaller than desktop, which is why the
 * crystal/lava/sun surface detail read as barely visible on mobile).
 *
 * CENTER_X_FRAC_* interpolates continuously by aspect ratio instead of a
 * fixed value: portrait screens keep the sphere closer to centred (a fixed
 * "88% across" position pushes most of a portrait-narrow frustum's sphere
 * off the right edge, cropping out the very surface detail sizing was just
 * fixed to make visible), landscape screens keep the original off-centre,
 * "giant object partially exiting the frame" composition. */
const SIZE_FRAC_HEIGHT = 0.6;
const SIZE_FRAC_WIDTH_CAP = 0.85;
const CENTER_X_FRAC_PORTRAIT  = 0.68;
const CENTER_X_FRAC_LANDSCAPE = 0.88;

const RIM_BLUE   = 0x2563eb;
const BRAND_VIOLET = 0x7c3aed;
const RIM_ORANGE = 0xff7a1a;
const ATM_BLUE   = 0x3b82f6;
const ATM_ORANGE = 0xff7a1a;

const CSS_VARS = [
  "--accent-gold", "--accent-gold-rgb", "--accent-gold-hover",
  "--accent-gold-text", "--glow-violet", "--glow-blue",
] as const;

export function Planet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let mounted = true;
    let rafId = 0;
    const toDispose: Array<{ dispose: () => void }> = [];
    let disposeRenderer: (() => void) | null = null;
    let disposeTextures: (() => void) | null = null;
    let killResizeObserver: (() => void) | null = null;
    let killScrollTrigger: (() => void) | null = null;
    let killVisibility: (() => void) | null = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    async function init() {
      const [THREE, gsapModule, stModule] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (!mounted || !canvas) return;

      const gsap = gsapModule.gsap;
      const ScrollTrigger = stModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const profile = detectQualityProfile();

      /* ─── Renderer ───────────────────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias:       profile.name !== "low",
        alpha:           true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.pixelRatioCap));
      renderer.setClearAlpha(0);
      disposeRenderer = () => renderer.dispose();

      const W = canvas.offsetWidth  || 800;
      const H = canvas.offsetHeight || 800;
      renderer.setSize(W * profile.renderScale, H * profile.renderScale, false);

      /* ─── Scene / camera ─────────────────────────────────────────────── */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
      camera.position.set(0, 0, CAMERA_Z);
      camera.lookAt(0, 0, 0);

      /* ─── Textures ───────────────────────────────────────────────────── */
      const { textures, dispose: disposeTex } = await loadKTX2Textures(THREE, renderer, {
        color:      "/textures/planet/color.ktx2",
        roughness:  "/textures/planet/roughness.ktx2",
        ao:         "/textures/planet/ao.ktx2",
        crystal:    "/textures/planet/crystal.ktx2",
        lava:       "/textures/planet/lava.ktx2",
        sun:        "/textures/planet/sun.ktx2",
        atmosphere: "/textures/planet/atmosphere.ktx2",
      });
      if (!mounted) {
        disposeTex();
        disposeRenderer();
        return;
      }
      disposeTextures = disposeTex;

      /* ─── Planet sphere — custom shader material ────────────────────── */
      const geo = new THREE.SphereGeometry(SPHERE_RADIUS, profile.segments, profile.segments);

      const uniforms = {
        uProgress:      { value: 0 },
        uTime:          { value: 0 },
        uExposure:      { value: 1.15 },
        uDisplacementScale: { value: profile.displacementScale },
        uColorMap:      { value: textures.color },
        uRoughnessMap:  { value: textures.roughness },
        uAoMap:         { value: textures.ao },
        uCrystalMap:    { value: textures.crystal },
        uLavaMap:       { value: textures.lava },
        uSunMap:        { value: textures.sun },
        uAmbientColor:  { value: new THREE.Color(BRAND_VIOLET).multiplyScalar(1.4) },
        uKeyLightDir:   { value: new THREE.Vector3(-4, 3, 5).normalize() },
        uKeyLightColor: { value: new THREE.Color(0xfff0e0) },
        uRimColor:      { value: new THREE.Color(RIM_BLUE) },
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
      });

      const sphere = new THREE.Mesh(geo, mat);
      scene.add(sphere);
      toDispose.push(geo, mat);

      /* ─── Atmosphere shell — additive glow, no post-processing needed ── */
      const atmGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 1.02, 64, 64);
      const atmMat = new THREE.MeshBasicMaterial({
        map:         textures.atmosphere,
        color:       new THREE.Color(ATM_BLUE),
        transparent: true,
        opacity:     0.5,
        blending:    THREE.AdditiveBlending,
        side:        THREE.BackSide,
        depthWrite:  false,
      });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      scene.add(atm);
      toDispose.push(atmGeo, atmMat);

      /* ─── Frustum-based world-space sizing — one formula, every aspect ── */
      const vFOV = THREE.MathUtils.degToRad(FOV);
      function layout(w: number, h: number) {
        const aspect = w / h;
        const frustumHalfHeight = CAMERA_Z * Math.tan(vFOV / 2);
        const frustumHeight     = frustumHalfHeight * 2;
        const frustumHalfWidth  = frustumHalfHeight * aspect;
        const frustumWidth      = frustumHalfWidth * 2;

        // Height is the primary target on every device; width is only a
        // generous overflow cap for unusually narrow viewports.
        const diameter = Math.min(SIZE_FRAC_HEIGHT * frustumHeight, SIZE_FRAC_WIDTH_CAP * frustumWidth);
        const scale = diameter / (SPHERE_RADIUS * 2);
        sphere.scale.setScalar(scale);
        atm.scale.setScalar(scale * (1 + coronaGrowth * 0.3));

        // Continuous by aspect ratio: portrait (aspect < ~0.7) stays closer
        // to centred, landscape (aspect > ~1.6) keeps the original
        // off-centre composition, everything between blends smoothly.
        const centerT = THREE.MathUtils.smoothstep(aspect, 0.7, 1.6);
        const centerXFrac = THREE.MathUtils.lerp(CENTER_X_FRAC_PORTRAIT, CENTER_X_FRAC_LANDSCAPE, centerT);
        const ndcX = centerXFrac * 2 - 1;
        const x = ndcX * frustumHalfWidth;
        sphere.position.x = x;
        atm.position.x = x;
      }

      /* ─── Scroll-driven progress ─────────────────────────────────────── */
      let targetProgress = 0;
      let currentProgress = 0;
      let coronaGrowth = 0;
      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
      });
      // Refresh after layout settles (fonts/images can shift document
      // height after first paint, especially on mobile).
      const refreshTimeouts = [
        window.setTimeout(() => ScrollTrigger.refresh(), 500),
        window.setTimeout(() => ScrollTrigger.refresh(), 2000),
      ];
      killScrollTrigger = () => {
        st.kill();
        refreshTimeouts.forEach((id) => window.clearTimeout(id));
      };

      layout(W, H);

      /* ─── Bloom (mid/high profiles only — see post-processing.ts) ──────
       * Low/reduced profiles never construct a composer at all: zero extra
       * draw calls, zero extra imports, for devices that can't afford it. */
      let bloom: Awaited<ReturnType<typeof createBloomComposer>> | null = null;
      if (profile.postFX) {
        bloom = await createBloomComposer(
          THREE, renderer, scene, camera,
          W * profile.renderScale, H * profile.renderScale,
        );
        if (!mounted) {
          bloom.dispose();
          disposeTex();
          disposeRenderer();
          return;
        }
      }

      /* ─── Render loop ────────────────────────────────────────────────── */
      const rimBlue   = new THREE.Color(RIM_BLUE);
      const rimViolet = new THREE.Color(BRAND_VIOLET);
      const rimOrange = new THREE.Color(RIM_ORANGE);
      const rimTmp    = new THREE.Color();
      const atmBlue   = new THREE.Color(ATM_BLUE);
      const atmOrange = new THREE.Color(ATM_ORANGE);
      const atmTmp    = new THREE.Color();
      const clock = new THREE.Clock();

      /* ─── Site-wide colour sync ───────────────────────────────────────
       * The same rim-colour ramp that lights the planet also drives the
       * public site's shared design tokens (--accent-gold and friends,
       * --glow-violet/--glow-blue) so buttons, borders, and the global
       * ambient background glow all track the planet's current stage.
       * Only ever touches document.documentElement while Planet is
       * mounted — Planet only renders inside the (site) route group, and
       * cleanup below removes every override on unmount so navigating to
       * /dashboard or /login can't leave a stale colour behind. Already
       * naturally throttled to profile.targetFPS by the frame-skip check
       * at the top of tick() — no separate throttle needed. */
      const cssRoot    = document.documentElement.style;
      const white      = new THREE.Color(0xffffff);
      const hoverTmp   = new THREE.Color();
      const textTmp    = new THREE.Color();
      const glowBlueTmp = new THREE.Color();

      function toSRGBChannels(c: InstanceType<typeof THREE.Color>) {
        const hex = c.getHexString();
        return {
          hex: `#${hex}`,
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        };
      }

      let lastFrameTime = 0;
      const frameInterval = 1000 / profile.targetFPS;
      function tick(now: number) {
        if (!mounted) return;
        rafId = requestAnimationFrame(tick);
        if (now - lastFrameTime < frameInterval) return;
        lastFrameTime = now;

        const elapsed = clock.getElapsedTime();
        currentProgress += (targetProgress - currentProgress) * 0.08;

        sphere.rotation.y += 0.0015;
        atm.rotation.y = sphere.rotation.y * 0.92;

        uniforms.uProgress.value = currentProgress;
        uniforms.uTime.value = elapsed;

        if (currentProgress < 0.5) {
          rimTmp.lerpColors(rimBlue, rimViolet, currentProgress / 0.5);
        } else {
          rimTmp.lerpColors(rimViolet, rimOrange, (currentProgress - 0.5) / 0.5);
        }
        uniforms.uRimColor.value.copy(rimTmp);

        const rim = toSRGBChannels(rimTmp);
        hoverTmp.copy(rimTmp).lerp(white, 0.15);
        textTmp.copy(rimTmp).lerp(white, 0.45);
        glowBlueTmp.copy(rimTmp).lerp(rimBlue, 0.5);
        const hover = toSRGBChannels(hoverTmp);
        const text = toSRGBChannels(textTmp);
        const glowBlue = toSRGBChannels(glowBlueTmp);

        cssRoot.setProperty("--accent-gold", rim.hex);
        cssRoot.setProperty("--accent-gold-rgb", `${rim.r} ${rim.g} ${rim.b}`);
        cssRoot.setProperty("--accent-gold-hover", hover.hex);
        cssRoot.setProperty("--accent-gold-text", text.hex);
        cssRoot.setProperty("--glow-violet", `rgba(${rim.r}, ${rim.g}, ${rim.b}, 0.45)`);
        cssRoot.setProperty("--glow-blue", `rgba(${glowBlue.r}, ${glowBlue.g}, ${glowBlue.b}, 0.35)`);

        const atmT = THREE.MathUtils.smoothstep(currentProgress, 0.15, 0.75);
        atmTmp.lerpColors(atmBlue, atmOrange, atmT);
        atmMat.color.copy(atmTmp);
        coronaGrowth = THREE.MathUtils.smoothstep(currentProgress, 0.75, 1.0);
        atmMat.opacity = THREE.MathUtils.lerp(0.35, 0.6, atmT) + coronaGrowth * 0.15;

        const exposure = 1.15 + coronaGrowth * 0.35;
        uniforms.uExposure.value = exposure;
        if (bloom) {
          bloom.bloomPass.strength = 0.6 * (1 + coronaGrowth * 0.6);
        }

        if (bloom) {
          bloom.composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }

      /* ─── Pause on hidden tab ────────────────────────────────────────────
       * WebGL rendering (especially with the bloom composer's 5 passes) is
       * real, continuous main-thread/GPU work. A background tab has no
       * visible pixels to update, so canceling the loop there costs nothing
       * visually and stops that work entirely for users who leave the tab
       * open in the background — and prevents this loop from competing with
       * the page's own hydration/interaction work while it's not visible. */
      function handleVisibility() {
        if (document.hidden) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = 0;
        } else if (mounted && !rafId) {
          lastFrameTime = 0;
          rafId = requestAnimationFrame(tick);
        }
      }
      document.addEventListener("visibilitychange", handleVisibility);
      killVisibility = () => document.removeEventListener("visibilitychange", handleVisibility);

      if (!document.hidden) {
        rafId = requestAnimationFrame(tick);
      }

      /* ─── Resize ─────────────────────────────────────────────────────── */
      const ro = new ResizeObserver(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w * profile.renderScale, h * profile.renderScale, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        layout(w, h);
        bloom?.setSize(w * profile.renderScale, h * profile.renderScale);
      });
      ro.observe(canvas);
      killResizeObserver = () => { ro.disconnect(); bloom?.dispose(); };
    }

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?:  (handle: number) => void;
    };
    const idleWindow = window as IdleWindow;
    let idleHandle    = 0;
    let timeoutHandle = 0;
    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(() => { void init(); }, { timeout: 2000 });
    } else {
      timeoutHandle = window.setTimeout(() => { void init(); }, 200);
    }

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      killResizeObserver?.();
      killScrollTrigger?.();
      killVisibility?.();
      toDispose.forEach((d) => d.dispose());
      disposeTextures?.();
      disposeRenderer?.();
      CSS_VARS.forEach((name) => document.documentElement.style.removeProperty(name));
      if (idleWindow.cancelIdleCallback && idleHandle) idleWindow.cancelIdleCallback(idleHandle);
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        pointerEvents: "none",
        zIndex:        -1,
      }}
    />
  );
}
