"use client";

import { useEffect, useRef } from "react";

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

/* ─── Component ─────────────────────────────────────────────────────────── */
export function SpaceBackground() {
  const starsRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <>
      {/* ── Spatial background (space-background.jpg via CSS #space-bg) ── */}
      <div id="space-bg" aria-hidden="true" />

      {/* ── Star particle canvas ──────────────────────────────────────── */}
      <canvas ref={starsRef} id="space-canvas" aria-hidden="true" />
    </>
  );
}
