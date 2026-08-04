"use client";

import { useEffect, useRef } from "react";
import { useScroll, useSpring } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  drift: number;
  phase: number;
}

const STAR_COUNT = 160;
const BASE_ALPHA_MIN = 0.08;
const BASE_ALPHA_MAX = 0.55;

/*
 * ─── Planet position constants ─────────────────────────────────────────────
 * Tune these three values to align the canvas sphere with the planet in
 * space-background.jpg.  Values are fractions of the viewport dimensions.
 *
 *   CX_RATIO  — planet centre X  (> 1.0 = off-screen right)
 *   CY_RATIO  — planet centre Y  (< 0   = above viewport)
 *   R_RATIO   — planet radius    (as a multiple of viewport height)
 */
const PLANET_CX = 1.02;   // centre X as fraction of viewport width
const PLANET_CY = -0.18;  // centre Y as fraction of viewport height
const PLANET_R  = 1.15;   // radius  as fraction of viewport height
const MAX_ROT   = Math.PI * 1.8; // total rotation over full page scroll (~324°)

/* ─── Component ─────────────────────────────────────────────────────────── */
export function SpaceBackground() {
  const starsRef  = useRef<HTMLCanvasElement>(null);
  const planetRef = useRef<HTMLCanvasElement>(null);

  /* Scroll progress 0→1 over the full page, spring-smoothed */
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 38, damping: 28, restDelta: 0.0001 });

  /* ── Star particle animation (unchanged) ─────────────────────────────── */
  useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.4 + 0.3,
      alpha: Math.random() * (BASE_ALPHA_MAX - BASE_ALPHA_MIN) + BASE_ALPHA_MIN,
      speed: (Math.random() - 0.5) * 0.06,
      drift: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    const particles: Star[] = Array.from({ length: 12 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 2 + 1.2,
      alpha: Math.random() * 0.25 + 0.05,
      speed: (Math.random() - 0.5) * 0.04,
      drift: Math.random() * 0.002 + 0.0005,
      phase: Math.random() * Math.PI * 2,
    }));

    let rafId: number;
    let t = 0;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (reduced) {
        stars.forEach(s => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 190, 255, ${s.alpha * 0.5})`;
          ctx.fill();
        });
        return;
      }

      t += 0.008;

      stars.forEach(s => {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.drift * 200 + s.phase));
        s.x += s.speed;
        if (s.x < -2)                s.x = canvas.width  + 2;
        if (s.x > canvas.width  + 2) s.x = -2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 195, 255, ${a})`;
        ctx.fill();
      });

      particles.forEach(p => {
        const a = p.alpha * (0.5 + 0.5 * Math.sin(t * p.drift * 200 + p.phase));
        p.x += p.speed;
        p.y += Math.sin(t * 0.3 + p.phase) * 0.05;
        if (p.x < -4)                p.x = canvas.width  + 4;
        if (p.x > canvas.width  + 4) p.x = -4;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(160, 130, 255, ${a})`);
        grad.addColorStop(1, "rgba(160, 130, 255, 0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 210, 255, ${Math.min(a * 2, 0.8)})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Rotating planet canvas ──────────────────────────────────────────── */
  useEffect(() => {
    const canvas = planetRef.current;
    if (!canvas) return;

    /* Disable on mobile — too small to matter, save resources */
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let W = 0, H = 0;
    let rafId = 0;
    let currentRot = 0;

    function drawPlanet(rot: number) {
      if (!ctx || W === 0) return;

      /* Planet geometry — adjust PLANET_CX / CY / R at top of file */
      const cx = W * PLANET_CX;
      const cy = H * PLANET_CY;
      const r  = H * PLANET_R;

      ctx.clearRect(0, 0, W, H);

      /* ── 1. Outer violet halo ──────────────────────────────────── */
      const halo = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.22);
      halo.addColorStop(0,   "rgba(90, 40, 200, 0.20)");
      halo.addColorStop(0.5, "rgba(60, 25, 160, 0.08)");
      halo.addColorStop(1,   "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      /* ── 2. Planet body ────────────────────────────────────────── */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      /* Base sphere — dark indigo radial gradient */
      const base = ctx.createRadialGradient(
        cx - r * 0.28, cy - r * 0.22, r * 0.04,
        cx + r * 0.12, cy + r * 0.18, r * 1.08
      );
      base.addColorStop(0,    "#30195e"); // lit upper-left
      base.addColorStop(0.28, "#1e0f44"); // mid purple
      base.addColorStop(0.55, "#120830"); // deep indigo
      base.addColorStop(1,    "#050210"); // near-black edge
      ctx.fillStyle = base;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      /* ── Rotating surface texture ─────────────────────────────── */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);

      /* Latitude bands (ellipses at different heights) */
      const bands = [
        { fy: -0.58, fh: 0.065, alpha: 0.11, hue: 270 },
        { fy: -0.38, fh: 0.090, alpha: 0.08, hue: 255 },
        { fy: -0.16, fh: 0.055, alpha: 0.12, hue: 285 },
        { fy:  0.05, fh: 0.075, alpha: 0.09, hue: 260 },
        { fy:  0.24, fh: 0.085, alpha: 0.10, hue: 275 },
        { fy:  0.44, fh: 0.065, alpha: 0.08, hue: 265 },
        { fy:  0.60, fh: 0.055, alpha: 0.09, hue: 280 },
      ] as const;

      for (const b of bands) {
        ctx.beginPath();
        ctx.ellipse(cx, cy + b.fy * r * 2, r * 0.97, r * b.fh, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${b.hue}, 55%, 42%, ${b.alpha})`;
        ctx.fill();
      }

      /* Swirling cloud-like patches */
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2 + rot * 0.18;
        const sx = cx + Math.cos(angle) * r * 0.52;
        const sy = cy + Math.sin(angle) * r * 0.26;
        const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 0.36);
        g2.addColorStop(0, `rgba(100, 48, 215, 0.07)`);
        g2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      /* Rocky surface grain — subtle noise layer */
      for (let i = 0; i < 20; i++) {
        const gx = cx + (Math.sin(i * 2.3 + rot) * r * 0.8);
        const gy = cy + (Math.cos(i * 1.7 + rot * 0.5) * r * 0.6);
        const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 0.14);
        gr.addColorStop(0, `rgba(15, 8, 40, ${0.05 + (i % 3) * 0.02})`);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      ctx.restore(); /* end rotation */

      /* ── Terminator shadow (static) — dark right/bottom edge ── */
      const shadow = ctx.createRadialGradient(
        cx - r * 0.18, cy - r * 0.18, r * 0.52,
        cx + r * 0.5,  cy + r * 0.52, r * 1.02
      );
      shadow.addColorStop(0,   "rgba(0,0,0,0)");
      shadow.addColorStop(0.55,"rgba(0,0,0,0.10)");
      shadow.addColorStop(1,   "rgba(0,0,0,0.72)");
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      ctx.restore(); /* end clip */

      /* ── 3. Atmospheric rim (static) ──────────────────────────── */
      ctx.save();
      const atm = ctx.createRadialGradient(cx, cy, r * 0.89, cx, cy, r * 1.05);
      atm.addColorStop(0,   "rgba(90, 48, 220, 0)");
      atm.addColorStop(0.45,"rgba(100, 52, 230, 0.16)");
      atm.addColorStop(1,   "rgba(110, 56, 240, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
      ctx.fillStyle = atm;
      ctx.fill();

      /* Rim stroke */
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(120, 60, 255, 0.22)";
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
      ctx.restore();

      /* ── 4. Specular highlight (upper-left) ───────────────────── */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      const spec = ctx.createRadialGradient(
        cx - r * 0.34, cy - r * 0.30, 0,
        cx - r * 0.30, cy - r * 0.26, r * 0.32
      );
      spec.addColorStop(0, "rgba(190, 160, 255, 0.18)");
      spec.addColorStop(0.6,"rgba(140, 110, 255, 0.05)");
      spec.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = spec;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    }

    function resize() {
      if (!canvas) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      drawPlanet(currentRot);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    drawPlanet(0);

    /* Scroll-driven rotation via framer-motion spring */
    const unsubscribe = smoothProgress.on("change", (v) => {
      currentRot = v * MAX_ROT;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawPlanet(currentRot));
    });

    return () => {
      window.removeEventListener("resize", resize);
      unsubscribe();
      cancelAnimationFrame(rafId);
    };
  }, [smoothProgress]);

  return (
    <>
      {/* ── Background spatial fixe (space-background.jpg via CSS) ─ */}
      <div id="space-bg" aria-hidden="true" />

      {/*
       * ── Rotating planet canvas ──────────────────────────────────
       * Rendered BEFORE the star canvas so stars appear in front of
       * the planet (same z-index, DOM order decides stacking).
       * Tune PLANET_CX / CY / R constants at the top of this file.
       */}
      <canvas
        ref={planetRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
      />

      {/* ── Star particle canvas ──────────────────────────────────── */}
      <canvas
        ref={starsRef}
        id="space-canvas"
        aria-hidden="true"
      />
    </>
  );
}
