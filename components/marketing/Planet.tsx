"use client";

import { useEffect, useRef } from "react";
import { detectQualityProfile } from "./planet/capabilities";
import { loadKTX2Textures } from "./planet/ktx2-loader";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./planet/shaders";

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
 * Deliberately still not in this phase: bloom/post-processing (lands right
 * after this, as its own small verifiable step), the particle burst, and
 * the site-wide colour sync (--glow-violet/--glow-blue) that the old
 * system drove — those are Phase 4.
 */

const SPHERE_RADIUS = 4;
const CAMERA_Z = 10.5;
const FOV = 44;
const SIZE_FRAC_WIDTH = 0.46;
const HEIGHT_CAP_FRAC = 0.6;
const CENTER_X_FRAC = 0.88;

const RIM_BLUE   = 0x2563eb;
const BRAND_VIOLET = 0x7c3aed;
const RIM_ORANGE = 0xff7a1a;
const ATM_BLUE   = 0x3b82f6;
const ATM_ORANGE = 0xff7a1a;

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

      /* ─── Frustum-based world-space sizing (unchanged from Phase 2) ──── */
      const vFOV = THREE.MathUtils.degToRad(FOV);
      function layout(w: number, h: number) {
        const aspect = w / h;
        const frustumHalfHeight = CAMERA_Z * Math.tan(vFOV / 2);
        const frustumHeight     = frustumHalfHeight * 2;
        const frustumHalfWidth  = frustumHalfHeight * aspect;
        const frustumWidth      = frustumHalfWidth * 2;

        const diameter = Math.min(SIZE_FRAC_WIDTH * frustumWidth, HEIGHT_CAP_FRAC * frustumHeight);
        const scale = diameter / (SPHERE_RADIUS * 2);
        sphere.scale.setScalar(scale);
        atm.scale.setScalar(scale * (1 + coronaGrowth * 0.3));

        const ndcX = CENTER_X_FRAC * 2 - 1;
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

      /* ─── Render loop ────────────────────────────────────────────────── */
      const rimBlue   = new THREE.Color(RIM_BLUE);
      const rimViolet = new THREE.Color(BRAND_VIOLET);
      const rimOrange = new THREE.Color(RIM_ORANGE);
      const rimTmp    = new THREE.Color();
      const atmBlue   = new THREE.Color(ATM_BLUE);
      const atmOrange = new THREE.Color(ATM_ORANGE);
      const atmTmp    = new THREE.Color();
      const clock = new THREE.Clock();

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

        const atmT = THREE.MathUtils.smoothstep(currentProgress, 0.15, 0.75);
        atmTmp.lerpColors(atmBlue, atmOrange, atmT);
        atmMat.color.copy(atmTmp);
        coronaGrowth = THREE.MathUtils.smoothstep(currentProgress, 0.75, 1.0);
        atmMat.opacity = THREE.MathUtils.lerp(0.35, 0.6, atmT) + coronaGrowth * 0.15;

        const exposure = 1.15 + coronaGrowth * 0.35;
        uniforms.uExposure.value = exposure;

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);

      /* ─── Resize ─────────────────────────────────────────────────────── */
      const ro = new ResizeObserver(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w * profile.renderScale, h * profile.renderScale, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        layout(w, h);
      });
      ro.observe(canvas);
      killResizeObserver = () => ro.disconnect();
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
      toDispose.forEach((d) => d.dispose());
      disposeTextures?.();
      disposeRenderer?.();
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
