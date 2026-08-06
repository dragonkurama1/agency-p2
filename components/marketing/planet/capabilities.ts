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

/*
 * ─── isTouchHandheld() ───────────────────────────────────────────────────
 * Used by PlanetLazy.tsx to decide whether to even DOWNLOAD the WebGL/
 * three.js chunk, before any QualityProfile scoring happens. Deliberately
 * ignores navigator.hardwareConcurrency / deviceMemory — testing (real
 * device + PageSpeed Insights' Moto G Power emulation) showed those two
 * signals are unreliable inside throttled/emulated environments: Chrome's
 * device emulation spoofs viewport, DPR, user agent and pointer type, but
 * NOT navigator.hardwareConcurrency/deviceMemory, which keep reporting the
 * HOST machine's real specs (e.g. a many-core cloud runner) even while the
 * page is being CPU-throttled 4-6x as if it were a weak phone. That skewed
 * detectQualityProfile() toward "mid" (bloom on) on what was actually being
 * measured as a small, coarse-pointer, heavily-throttled device — this
 * function is a coarser but far more trustworthy signal for the
 * highest-stakes decision (mount WebGL at all, yes/no), based only on
 * pointer type and viewport size, both of which ARE faithfully emulated.
 * Math.min(width,height) < 700 catches phones in either orientation while
 * excluding tablets/small laptops (iPad mini's 768px shorter side stays
 * above the threshold, laptops are pointer:fine).
 */
export function isTouchHandheld(): boolean {
  if (typeof window === "undefined") return false;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallestSide = Math.min(window.innerWidth, window.innerHeight);
  return coarsePointer && smallestSide < 700;
}
