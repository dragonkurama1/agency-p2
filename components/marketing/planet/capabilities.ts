"use client";

/*
 * ─── capabilities.ts ─────────────────────────────────────────────────────
 * ONE scored device-capability detector instead of a mobile/desktop branch.
 * Everything downstream (Planet.tsx, and later the shader/post-processing
 * phases) reads numeric knobs off the returned QualityProfile — nothing
 * ever checks screen width or a user-agent string to decide how to render.
 * That's what keeps this a single codebase for every device: adding a new
 * capability signal means editing the score below, not adding an
 * "if (isMobile)" somewhere in the render loop.
 *
 * Signals used: CPU core count and (where Chrome exposes it) approximate
 * device memory as raw horsepower proxies, viewport area as a rough
 * "how much screen is this GPU expected to fill" proxy, and pointer type
 * (coarse/touch skews towards weaker average hardware) — combined into one
 * continuous score, then bucketed. prefers-reduced-motion always wins
 * outright, regardless of how powerful the device is.
 */

export type QualityProfile = {
  name: "low" | "mid" | "high";
  segments: number;          // sphere geometry subdivision (width/height segments)
  pixelRatioCap: number;     // devicePixelRatio cap for the render buffer
  renderScale: number;       // internal resolution vs CSS size (see Planet.tsx)
  targetFPS: number;         // render-loop cap
  particleCount: number;     // reserved for a later particle-burst pass
  postFX: boolean;           // gates the bloom pass (added right after this phase)
  displacementScale: number; // procedural relief strength — 0 disables the effect entirely
};

const REDUCED_PROFILE: QualityProfile = {
  name: "low", segments: 48, pixelRatioCap: 1, renderScale: 0.6,
  targetFPS: 24, particleCount: 0, postFX: false, displacementScale: 0,
};
const LOW_PROFILE: QualityProfile = {
  name: "low", segments: 64, pixelRatioCap: 2, renderScale: 0.65,
  targetFPS: 30, particleCount: 80, postFX: false, displacementScale: 0.06,
};
const MID_PROFILE: QualityProfile = {
  name: "mid", segments: 128, pixelRatioCap: 2, renderScale: 0.75,
  targetFPS: 30, particleCount: 220, postFX: true, displacementScale: 0.1,
};
const HIGH_PROFILE: QualityProfile = {
  name: "high", segments: 192, pixelRatioCap: 2, renderScale: 0.85,
  targetFPS: 60, particleCount: 480, postFX: true, displacementScale: 0.14,
};

export function detectQualityProfile(): QualityProfile {
  // Server/build-time guard — Planet only ever mounts client-side via
  // next/dynamic({ ssr:false }), so this branch is never actually reached
  // at runtime; it just keeps the function safely typed/callable.
  if (typeof window === "undefined") return LOW_PROFILE;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return REDUCED_PROFILE;
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memoryGB = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const viewportArea = window.innerWidth * window.innerHeight;

  let score = 0;
  score += Math.min(cores, 8) / 8;                                            // 0..1
  score += Math.min(memoryGB, 8) / 8;                                         // 0..1
  score += viewportArea > 1_500_000 ? 1 : viewportArea > 700_000 ? 0.6 : 0.2;  // 0.2..1
  score += coarsePointer ? 0.1 : 0.6;                                         // 0.1 or 0.6

  if (score >= 2.4) return HIGH_PROFILE;
  if (score >= 1.5) return MID_PROFILE;
  return LOW_PROFILE;
}
