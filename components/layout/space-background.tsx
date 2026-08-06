"use client";

import { useEffect, useRef } from "react";
import { isTouchHandheld } from "@/components/marketing/planet/capabilities";

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

/* Uncapped requestAnimationFrame here means this loop runs at whatever
 * refresh rate the display/browser gives it (60-144Hz), forever, on every
 * single page — unlike Planet.tsx (which is frame-rate-capped per quality
 * profile), nothing throttled this. 30fps is visually identical for a
 * slow star drift but roughly halves (or more) the sustained main-thread
 * work Lighthouse (and real low-end devices) see on every page load. */
const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

/* ─── Component ─────────────────────────────────────────────────────────── */
export function SpaceBackground() {
  const starsRef = useRef<HTMLCanvasElement>(null);

  /* ── Star particle animation — desktop/pointer:fine only ──────────────
   * Mobile/handheld (isTouchHandheld() — same signal PlanetLazy.tsx uses
   * to skip WebGL) never runs any of this: no canvas context, no star/
   * particle arrays, no requestAnimationFrame loop at all. Real-device
   * testing this session showed the WebGL planet was the dominant mobile
   * cost, but this canvas ran unconditionally on every page too — cutting
   * it on mobile removes that cost entirely rather than just capping it. */
  useEffect(() => {
    if (isTouchHandheld()) return;

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

    /* Pre-bake the particle glow once into an offscreen sprite instead of
     * calling ctx.createRadialGradient() + fill() for every particle on
     * every frame. Gradient construction is the expensive part; drawImage
     * of a cached bitmap is cheap. Sized for the largest possible particle
     * radius (r up to ~3.2) so it can be scaled down for smaller ones. */
    const GLOW_SPRITE_SIZE = 64;
    const glowSprite = document.createElement("canvas");
    glowSprite.width = GLOW_SPRITE_SIZE;
    glowSprite.height = GLOW_SPRITE_SIZE;
    const glowCtx = glowSprite.getContext("2d");
    if (glowCtx) {
      const c = GLOW_SPRITE_SIZE / 2;
      const grad = glowCtx.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0, "rgba(160, 130, 255, 1)");
      grad.addColorStop(1, "rgba(160, 130, 255, 0)");
      glowCtx.fillStyle = grad;
      glowCtx.beginPath();
      glowCtx.arc(c, c, c, 0, Math.PI * 2);
      glowCtx.fill();
    }

    let rafId: number;
    let t = 0;
    let lastFrameTime = 0;

    function draw(now: number) {
      if (!canvas || !ctx) return;
      rafId = requestAnimationFrame(draw);

      // Cap the loop to TARGET_FPS — this canvas runs on every page for
      // the whole session, so an uncapped rAF loop is pure wasted work
      // above what's visually perceptible for a slow star drift.
      if (now - lastFrameTime < FRAME_INTERVAL_MS) return;
      lastFrameTime = now;

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

        const glowR = p.r * 4;
        ctx.globalAlpha = a;
        ctx.drawImage(glowSprite, p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 210, 255, ${Math.min(a * 2, 0.8)})`;
        ctx.fill();
      });
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* ── Spatial background (space-background.webp via CSS #space-bg) ── */}
      <div id="space-bg" aria-hidden="true" />

      {/*
       * ── Ambient colour wash ─────────────────────────────────────────
       * Reads --glow-violet / --glow-blue (defined in globals.css, static
       * fallback values). On desktop, Planet.tsx overwrites both every
       * frame to track the 3D scene's current narrative stage. On mobile,
       * nothing overrides them (Planet renders nothing there at all — see
       * PlanetLazy.tsx) so this stays the fixed static brand-violet wash,
       * which is the intended, lower-cost mobile behaviour.
       */}
      <div id="ambient-glow" aria-hidden="true" />

      {/* ── Star particle canvas ──────────────────────────────────────── */}
      <canvas ref={starsRef} id="space-canvas" aria-hidden="true" />
    </>
  );
}
