"use client";

/*
 * ─── PlanetStaticFallback.tsx ────────────────────────────────────────────
 * Mobile/handheld replacement for Planet.tsx (see PlanetLazy.tsx — chosen
 * via isTouchHandheld() before three.js is ever imported, so phones never
 * download that chunk at all, let alone run it).
 *
 * Real-device + PageSpeed Insights testing this session confirmed the
 * WebGL planet (even after the frame-cap, sprite-reuse and visibilitychange
 * fixes already applied) is still the dominant remaining cost on mobile —
 * removing its textures entirely (forcing init() to fail before the render
 * loop starts) was enough by itself to bring the mobile score back to a
 * healthy range. That isolates the cost to the WebGL rendering itself, not
 * just the bloom pass or the texture download.
 *
 * This component keeps the same visual *language* (a glowing orb that
 * shifts blue → violet → orange with scroll, and drives the same
 * site-wide --accent-gold/--glow-* tokens so buttons/glows still track
 * scroll position identically to desktop) at near-zero cost: a single CSS
 * radial-gradient div, recoloured only on scroll events (passive, rAF-
 * deduped — not a perpetual render loop) instead of a continuous WebGL/
 * canvas render loop. No Three.js, no GSAP, no canvas, no compositing work
 * between scroll events.
 */

import { useEffect, useRef } from "react";

const RIM_BLUE     = [37, 99, 235];    // 0x2563eb — matches Planet.tsx RIM_BLUE
const BRAND_VIOLET = [124, 58, 237];   // 0x7c3aed — matches Planet.tsx BRAND_VIOLET
const RIM_ORANGE   = [255, 122, 26];   // 0xff7a1a — matches Planet.tsx RIM_ORANGE
const WHITE        = [255, 255, 255];

const CSS_VARS = [
  "--accent-gold", "--accent-gold-rgb", "--accent-gold-hover",
  "--accent-gold-text", "--glow-violet", "--glow-blue",
] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpRGB(a: number[], b: number[], t: number) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function toHex([r, g, b]: number[]) {
  const h = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
function toRGBString([r, g, b]: number[]) {
  return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
}

export function PlanetStaticFallback() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cssRoot = document.documentElement.style;
    let ticking = false;

    function update() {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      const rim =
        progress < 0.5
          ? lerpRGB(RIM_BLUE, BRAND_VIOLET, progress / 0.5)
          : lerpRGB(BRAND_VIOLET, RIM_ORANGE, (progress - 0.5) / 0.5);

      const hover = lerpRGB(rim, WHITE, 0.15);
      const text = lerpRGB(rim, WHITE, 0.45);
      const light = lerpRGB(rim, WHITE, 0.35);
      const glowBlue = lerpRGB(rim, RIM_BLUE, 0.5);

      cssRoot.setProperty("--accent-gold", toHex(rim));
      cssRoot.setProperty("--accent-gold-rgb", toRGBString(rim));
      cssRoot.setProperty("--accent-gold-hover", toHex(hover));
      cssRoot.setProperty("--accent-gold-text", toHex(text));
      cssRoot.setProperty("--glow-violet", `rgba(${toRGBString(rim).replace(/ /g, ", ")}, 0.45)`);
      cssRoot.setProperty("--glow-blue", `rgba(${toRGBString(glowBlue).replace(/ /g, ", ")}, 0.35)`);

      const orb = orbRef.current;
      if (orb) {
        const corona = Math.max(0, (progress - 0.75) / 0.25);
        orb.style.setProperty("--orb-color", toHex(rim));
        orb.style.setProperty("--orb-color-light", toHex(light));
        orb.style.setProperty("--orb-scale", String(1 + corona * 0.25));
        orb.style.setProperty("--orb-opacity", String(0.5 + corona * 0.25));
      }
    }

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      CSS_VARS.forEach((name) => document.documentElement.style.removeProperty(name));
    };
  }, []);

  return <div ref={orbRef} aria-hidden="true" className="planet-static-orb" />;
}
