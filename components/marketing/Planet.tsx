"use client";

import { useEffect, useRef } from "react";

/*
 * ─── Planet.tsx ─────────────────────────────────────────────────────────────
 * A real Three.js sphere driven by ONE custom ShaderMaterial (not a swapped
 * material, not a texture crossfade). A single master uniform — uProgress,
 * 0→1 — procedurally blends the surface through four states as the page is
 * scrolled: frozen planet → violet crystal veins → molten lava → living sun.
 * The blend, the cracks, the crystal growth, the lava propagation and the
 * solar granulation are all computed per-fragment from simplex-noise/fBm
 * masks — nothing is a flat crossfade and nothing is a 2D image swap.
 *
 * Post-processing (AAA cinematic pipeline, tiered per device):
 * A THREE.EffectComposer chain — RenderPass → UnrealBloomPass → (desktop
 * only) a custom heat-distortion ShaderPass → OutputPass (ACES filmic +
 * sRGB, reading renderer.toneMapping/outputColorSpace) → (desktop only) a
 * custom chromatic-aberration/vignette/procedural-lens-dirt ShaderPass →
 * (desktop/tablet) FXAA — replaces the old hand-rolled in-shader tonemap.
 * Because everything now composites through OutputPass at the very end,
 * the planet's own fragment shader outputs raw linear HDR (no manual
 * acesFilmic/linearToSRGB anymore) so bloom can correctly extract
 * above-1.0 emissive values before the single final tonemap. At uProgress
 * ≈ 0.94→1.0 a GPU-cheap THREE.Points particle burst (radial from the
 * sphere surface, additive, orange→gold, no white flash) layers a final
 * "energy release" on top, sized per tier.
 *
 * Transparency: THREE.UnrealBloomPass hardcodes alpha to 1.0 in its
 * internal blur/composite shaders and additively blends a full-screen quad
 * every frame, which saturates the whole canvas's alpha to ~1 regardless of
 * content — left unfixed, this turns the canvas into an opaque black/white
 * rectangle instead of a transparent element that only shows the sphere and
 * its glow. A SavePass snapshots the clean alpha right after RenderPass
 * (before bloom touches anything), and a final always-on ShaderPass
 * restores that alpha into the fully-processed frame — on every tier,
 * since bloom (and the corruption) runs on every tier.
 *
 * Architecture: ONE global canvas, mounted ONCE at the (site) route-group's
 * layout — never inside a section, never inside a wrapper with overflow/
 * max-width/margins. The canvas is fixed to the full viewport (100vw x
 * 100vh, top:0/left:0) and never moves; the HTML scrolls OVER it. The
 * planet is not a DOM-sized/cropped element — it exists in 3D world space,
 * and its on-screen size/position are computed purely from the camera's
 * frustum (see updateGroupTransform()), sized ~50% of viewport width on
 * desktop, ~20% smaller on tablet, capped sensibly on mobile portrait —
 * partially exiting the right edge of the frustum by design, with nothing
 * in the DOM to clip it. Camera is fixed for the component's whole
 * lifetime (position/lookAt set once, never touched again); only the
 * planet/atmosphere rotate and the shader evolves. Rotation AND uProgress
 * both come from a single global ScrollTrigger mapped to the full document
 * height (start 0 → end ScrollTrigger.maxScroll(window)) — there is no
 * per-section trigger anywhere in this file. This is a decorative,
 * non-blocking, pointer-events:none layer: it does not gate the site behind
 * an intro sequence, and every post-processing pass below is tier-gated to
 * protect the Lighthouse perf work already done on this page (22MB → ~2MB,
 * 21s TBT → idle-deferred).
 *
 * Folder structure (existing project architecture, nothing new added):
 *   components/marketing/Planet.tsx   ← this file (shaders + passes inlined)
 *   public/textures/planet/*.ktx2     ← 10 PBR/narrative maps, GPU block-compressed
 *                                        (Basis Universal), transcoded via KTX2Loader
 *   app/(site)/layout.tsx             ← mounts <Planet /> globally, once, at the top
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ─── Tuning constants ──────────────────────────────────────────────────── */
const SPHERE_RADIUS   = 4;
const CAMERA_Z        = 10.5;
const FOV             = 44;          // degrees
const LERP_FACTOR     = 0.08;        // scroll-rotation / scroll-progress smoothing
const PIXEL_RATIO_CAP = 2;           // GPU memory guard

/* Brand / narrative colours */
const BRAND_VIOLET  = 0x7c3aed;
const BRAND_DEEP    = 0x200e3b;
const RIM_BLUE       = 0x3b82f6;
const RIM_ORANGE     = 0xff7a1a;
const ATM_BLUE       = 0x4c6ef5;
const ATM_ORANGE     = 0xff8c1a;

type Tier = "mobile" | "tablet" | "desktop";

function getTier(width: number): Tier {
  if (width < 768) return "mobile";
  if (width < 1280) return "tablet";
  return "desktop";
}

/* Per-tier quality. Desktop gets the full 512-segment sphere; tablet and
 * mobile step down geometry density and vertex-shader relief (displacement
 * map amount, lava "inflate", sun-phase turbulence) to protect 60fps. */
const SEGMENTS: Record<Tier, number> = {
  mobile:  128,
  tablet:  256,
  desktop: 512,
};

const DISPLACEMENT_SCALE: Record<Tier, number> = {
  mobile:  0,
  tablet:  0.17,
  desktop: 0.22,
};

const INFLATE_AMOUNT: Record<Tier, number> = {
  mobile:  0,
  tablet:  0.07,
  desktop: 0.10,
};

const TURBULENCE_AMOUNT: Record<Tier, number> = {
  mobile:  0,
  tablet:  0.12,
  desktop: 0.20,
};

/* Exaggerates the normal map's bump contribution to lighting (see
 * perturbNormal() in the fragment shader) — a per-pixel shading effect,
 * essentially free compared to geometric displacement, so even mobile
 * (which keeps DISPLACEMENT_SCALE at 0 for performance) still gets visible
 * surface relief from lighting alone. */
const NORMAL_STRENGTH: Record<Tier, number> = {
  mobile:  1.6,
  tablet:  1.9,
  desktop: 2.3,
};

/* ─── World-space sizing/positioning ────────────────────────────────────
 * The planet is NOT a small DOM-sized decoration cropped by a small canvas
 * — the canvas is the full viewport, and the planet's apparent size/
 * position are computed in 3D world space from the camera's frustum at
 * SPHERE_RADIUS's fixed depth (the camera never moves). This is what lets
 * it sit "in space" behind the whole site, partially off the right edge,
 * without ever being clipped by a container, max-width, or overflow rule —
 * there simply isn't one; the only boundary is the viewport itself.
 *
 * SIZE_FRAC_WIDTH is the planet's target on-screen diameter as a fraction
 * of viewport WIDTH (desktop ~50%, tablet ~20% smaller, per spec). Mobile
 * keeps a comparable width fraction but is additionally capped as a
 * fraction of viewport HEIGHT (MOBILE_HEIGHT_CAP) — mobile viewports are
 * usually portrait, where width-only sizing would blow the sphere up to a
 * comically large fraction of the screen height; the cap keeps it giant
 * without becoming absurd. CENTER_X_FRAC places the sphere's center as a
 * fraction of viewport width from the left (0.5 = dead centre, 1.0 = right
 * edge) — desktop/tablet/mobile all sit right-of-centre with part of the
 * sphere naturally exiting past the right edge of the frustum. */
const SIZE_FRAC_WIDTH: Record<Tier, number> = {
  mobile:  0.46,
  tablet:  0.40,
  desktop: 0.50,
};
const MOBILE_HEIGHT_CAP = 0.6; // sphere never exceeds ~60% of viewport height on mobile
const CENTER_X_FRAC: Record<Tier, number> = {
  mobile:  0.85,
  tablet:  0.88,
  desktop: 0.90,
};

/* Post-processing quality per tier — bloom always runs (cheapest, biggest
 * visual win for the "getting hot" read); heat-distortion, chromatic
 * aberration/lens-dirt and FXAA step in only where the device can afford
 * the extra full-screen passes. */
const BLOOM_STRENGTH: Record<Tier, number> = {
  mobile:  0.45,
  tablet:  0.85,
  desktop: 1.25,
};
const BLOOM_RADIUS: Record<Tier, number> = {
  mobile:  0.25,
  tablet:  0.4,
  desktop: 0.55,
};
const BLOOM_THRESHOLD: Record<Tier, number> = {
  mobile:  0.8,
  tablet:  0.68,
  desktop: 0.55,
};
const WANTS_HEAT_DISTORTION: Record<Tier, boolean> = { mobile: false, tablet: false, desktop: true };
const WANTS_FINAL_COMPOSITE: Record<Tier, boolean> = { mobile: false, tablet: false, desktop: true };
const WANTS_FXAA: Record<Tier, boolean> = { mobile: false, tablet: true, desktop: true };
const WANTS_MSAA: Record<Tier, boolean> = { mobile: false, tablet: false, desktop: true };

const PARTICLE_COUNT: Record<Tier, number> = {
  mobile:  80,
  tablet:  220,
  desktop: 480,
};

/* ─── Shared GLSL: simplex noise + fBm ──────────────────────────────────────
 * Classic Ashima Arts 3D simplex noise (public-domain-equivalent, MIT
 * licence, the standard implementation embedded in virtually every WebGL
 * shader that needs organic noise). Duplicated into both shader stages below
 * since GLSL programs don't share source across vertex/fragment — that is
 * expected and not a bug.
 */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return sum;
}
`;

/* ─── Vertex shader ──────────────────────────────────────────────────────
 * modelMatrix / modelViewMatrix / projectionMatrix / normalMatrix / position
 * / normal / uv are all auto-injected by THREE.ShaderMaterial — no manual
 * declaration needed (this is what distinguishes ShaderMaterial from
 * RawShaderMaterial).
 *
 * Displacement stack, all driven by uProgress:
 *   1. base relief from the real height map (always on, tier-scaled)
 *   2. "lava inflate" — the planet slightly swells as it turns molten
 *   3. sun-phase turbulence — animated fBm convection bulging, so the
 *      surface keeps moving even at rest (never static)
 */
const VERTEX_SHADER = /* glsl */ `
${NOISE_GLSL}

uniform float uProgress;
uniform float uTime;
uniform sampler2D uHeightMap;
uniform float uDisplacementScale;
uniform float uInflateAmount;
uniform float uTurbulenceAmount;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  float h = texture2D(uHeightMap, uv).r;

  float lavaInflate    = smoothstep(0.55, 0.80, uProgress) * uInflateAmount * h;
  float sunTurbulence   = fbm(position * 1.6 + vec3(0.0, 0.0, uTime * 0.35))
                        * smoothstep(0.82, 1.0, uProgress)
                        * uTurbulenceAmount;

  float disp = h * uDisplacementScale + lavaInflate + sunTurbulence;

  vec3 displaced = position + normal * disp;

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

/* ─── Fragment shader ──────────────────────────────────────────────────────
 * Stage weights (wPlanet/wCrystal/wLava/wSun) are smoothstep bands over
 * uProgress with deliberate overlap, normalized to sum to 1 — this is the
 * "nothing suddenly appears" requirement: every transition is a continuous
 * cross-blend, not a cut.
 *
 * Output: this material now writes RAW LINEAR HDR colour (no manual
 * tonemap/encode) because the render pipeline runs through an
 * EffectComposer — UnrealBloomPass needs to see genuine above-1.0 emissive
 * values to extract believable glow, and OutputPass applies the single,
 * correct ACES-filmic + sRGB conversion once at the very end of the chain,
 * after bloom/distortion/aberration have all operated on the linear image.
 * uExposure is still kept in lockstep with renderer.toneMappingExposure
 * from the JS side every frame, so the whole scene (this shader + the
 * plain-material atmosphere/corona/particles) brightens together as the
 * planet becomes a sun.
 */
const FRAGMENT_SHADER = /* glsl */ `
${NOISE_GLSL}

uniform float uProgress;
uniform float uTime;
uniform float uExposure;

uniform sampler2D uColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uAoMap;
uniform sampler2D uCrystalMap;
uniform sampler2D uLavaMap;
uniform sampler2D uSunMap;

uniform vec3 uAmbientColor;
uniform vec3 uKeyLightDir;
uniform vec3 uKeyLightColor;
uniform vec3 uRimColor;
uniform float uNormalStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

/* Derivative-based tangent frame — perturbs the geometric normal using the
 * normal map without requiring a precomputed tangent attribute. Standard
 * "cotangent frame" technique (Mikkelsen / Christian Schüler). */
mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(uv);
  vec2 duv2 = dFdy(uv);
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
  float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
  return mat3(T * invmax, B * invmax, N);
}

vec3 perturbNormal(vec3 N, vec3 V, vec2 uv) {
  vec3 mapN = texture2D(uNormalMap, uv).xyz * 2.0 - 1.0;
  /* Exaggerate the tangent-space XY tilt before renormalizing — this is
   * the standard "normal strength" technique (scale bump direction, keep
   * unit length) and is what gives the surface visible relief from
   * lighting alone, on top of the (comparatively much subtler) geometric
   * vertex displacement. Renormalizing after the scale keeps the vector
   * a valid unit normal regardless of strength. */
  mapN.xy *= uNormalStrength;
  mapN = normalize(mapN);
  mat3 TBN = cotangentFrame(N, -V, uv);
  return normalize(TBN * mapN);
}

void main() {
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 N = normalize(vNormal);
  N = perturbNormal(N, V, vUv);

  /* ── Stage weights — overlapping smoothstep bands, normalized ────────── */
  float wPlanet  = 1.0 - smoothstep(0.0, 0.18, uProgress);
  float wCrystal = smoothstep(0.05, 0.20, uProgress) * (1.0 - smoothstep(0.42, 0.58, uProgress));
  float wLava    = smoothstep(0.42, 0.60, uProgress) * (1.0 - smoothstep(0.80, 0.92, uProgress));
  float wSun     = smoothstep(0.80, 0.97, uProgress);
  float wSum = max(wPlanet + wCrystal + wLava + wSun, 0.0001);
  wPlanet /= wSum; wCrystal /= wSum; wLava /= wSum; wSun /= wSum;

  /* ── Albedo blend across the four narrative textures ──────────────────── */
  vec3 colorPlanet  = texture2D(uColorMap, vUv).rgb;
  vec3 colorCrystal = texture2D(uCrystalMap, vUv).rgb;
  vec3 colorLava    = texture2D(uLavaMap, vUv).rgb;
  vec2 sunUv = vUv + vec2(uTime * 0.006, 0.0); // slow drifting plasma, never static
  vec3 colorSun = texture2D(uSunMap, sunUv).rgb;

  vec3 albedo = colorPlanet * wPlanet + colorCrystal * wCrystal + colorLava * wLava + colorSun * wSun;

  float ao = texture2D(uAoMap, vUv).r;
  float roughness = texture2D(uRoughnessMap, vUv).r;

  /* ── Procedural crack / vein mask — ridged fBm, animated ────────────────
   * The ridge is thresholded with an fwidth()-based adaptive smoothstep
   * (screen-space derivative of the noise value) instead of a hard pow()
   * cutoff — pow() alone creates a razor-thin, high-frequency ridge that
   * shimmers/aliases as the surface rotates, independent of MSAA (MSAA only
   * antialiases geometric silhouette edges, not per-fragment shader detail
   * like this). Widening the transition band by exactly one derivative-
   * width keeps the ridge looking crisp up close while remaining stable
   * under motion and at a distance. */
  float crackNoise = fbm(vWorldPosition * 2.2 + vec3(0.0, uTime * 0.05, 0.0));
  float ridge = 1.0 - abs(crackNoise);
  float ridgeAA = fwidth(ridge) + 0.0001;
  float crackMask = smoothstep(0.72 - ridgeAA, 0.72 + ridgeAA, ridge);
  crackMask = pow(crackMask, 2.2);

  /* Crystal growth follows its own slower noise field — this is what makes
   * the veins emerge from specific fracture points rather than uniformly. */
  float crystalGrowth = smoothstep(0.15, 0.85, fbm(vWorldPosition * 1.4));

  vec3 violet   = vec3(0.55, 0.22, 0.95);
  vec3 orange   = vec3(1.0, 0.38, 0.05);
  vec3 hotWhite = vec3(1.0, 0.85, 0.55);

  vec3 emissive = vec3(0.0);
  emissive += violet * crackMask * crystalGrowth * wCrystal * 2.0;
  emissive += orange * crackMask * wLava * 3.2;

  /* Solar granulation / convection cells — a second, faster noise field so
   * the sun stage reads as a living, boiling surface. */
  float granulation = fbm(vWorldPosition * 3.0 + vec3(uTime * 0.12));
  vec3 plasma = mix(orange, hotWhite, 0.5 + 0.5 * sin(uTime * 1.3 + vWorldPosition.x * 2.0));
  emissive += plasma * wSun * 3.6;
  emissive += hotWhite * clamp(granulation, 0.0, 1.0) * wSun * 1.6;

  /* ── Hand-rolled lighting — this material ignores scene THREE.Light
   * objects entirely (a raw ShaderMaterial doesn't receive them without
   * manually forwarding them, which is what these uniforms are). Ambient +
   * Lambertian key light stand in for AmbientLight/DirectionalLight/
   * HemisphereLight; uRimColor is updated every frame from JS, continuously
   * interpolating Blue → Purple → Orange as uProgress advances — that
   * single evolving rim uniform fulfils "Blue Rim / Purple Rim / Orange
   * Solar Light, evolving continuously" without three extra light objects
   * this material can't see anyway. ────────────────────────────────────── */
  /* Ambient toned down and key light pushed up relative to the previous
   * balance — a bright ambient term flattens exactly the kind of gradual
   * shading that reads as "3D sphere" from a distance; a punchier
   * diffuse+specular contrast is what sells the relief the normal map and
   * displacement are actually producing. */
  float ndl = max(dot(N, normalize(uKeyLightDir)), 0.0);
  vec3 lit = uAmbientColor * ao * 0.6 + uKeyLightColor * ndl * ao * 1.35;

  vec3 H = normalize(normalize(uKeyLightDir) + V);
  float spec = pow(max(dot(N, H), 0.0), mix(180.0, 24.0, roughness)) * (1.0 - roughness);
  lit += uKeyLightColor * spec * 1.1;

  float rimFactor = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  lit += uRimColor * rimFactor * 1.15;

  /* As the surface becomes self-luminous (sun stage) external lighting
   * matters less — it should glow from within, not reflect. */
  float litFade = 1.0 - wSun * 0.92;
  vec3 finalColor = albedo * lit * litFade + emissive;

  gl_FragColor = vec4(finalColor * uExposure, 1.0);
}
`;

/* ─── Custom post-process passes (ShaderPass definitions) ─────────────────
 * Shared full-screen-quad vertex shader — the standard boilerplate used by
 * every custom ShaderPass in three.js's own examples (CopyShader, DotScreen,
 * RGBShift, etc.): position/uv come from ShaderPass's internal quad
 * geometry, projectionMatrix/modelViewMatrix from its internal ortho camera.
 */
const PASSTHROUGH_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* Restores a clean alpha channel at the very end of the chain. Necessary
 * because THREE.UnrealBloomPass's internal blur/composite shaders hardcode
 * alpha to 1.0 and additively blend a full-screen quad over the whole
 * buffer every frame — this saturates alpha to ~1 across the ENTIRE canvas
 * regardless of what was actually drawn, which is what turns this element
 * into an opaque black/white rectangle instead of a transparent canvas that
 * only shows the sphere/glow. tAlphaMask is a snapshot taken via SavePass
 * immediately after RenderPass, before bloom (or anything else) has had a
 * chance to touch alpha — its RGB is discarded, only its (correct) alpha
 * survives into the final frame. Runs on every tier, since bloom runs on
 * every tier and corrupts alpha on every tier. */
const ALPHA_RESTORE_FRAGMENT = /* glsl */ `
uniform sampler2D tDiffuse;
uniform sampler2D tAlphaMask;
varying vec2 vUv;

void main() {
  vec3 rgb = texture2D(tDiffuse, vUv).rgb;
  float a = texture2D(tAlphaMask, vUv).a;
  gl_FragColor = vec4(rgb, a);
}
`;

/* Cheap screen-space heat shimmer — desktop only. Layered sine-wave UV
 * warp (far cheaper than per-pixel simplex/fBm) driven by uIntensity, which
 * JS ramps up as the lava/sun stages take over. */
const HEAT_DISTORTION_FRAGMENT = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float shift = uIntensity * 0.012;
  uv.x += sin(uv.y * 38.0 + uTime * 2.6) * shift;
  uv.y += cos(uv.x * 34.0 + uTime * 2.1) * shift * 0.6;
  gl_FragColor = texture2D(tDiffuse, uv);
}
`;

/* Subtle chromatic aberration (radial RGB channel offset, stronger at the
 * edges) + soft vignette + procedural lens-dirt smudges modulated by local
 * scene brightness (so dirt only "catches light" near bloom highlights,
 * never a flat overlay). Desktop only — this runs after OutputPass, i.e. on
 * the already-tonemapped/encoded image, which is the correct place for a
 * lens/sensor artifact like this. */
const FINAL_COMPOSITE_FRAGMENT = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uAberration;
uniform float uDirtIntensity;
varying vec2 vUv;

float smudge(vec2 uv, vec2 center, float radius, float soft) {
  float d = length(uv - center);
  return 1.0 - smoothstep(radius - soft, radius + soft, d);
}

void main() {
  vec2 center = vec2(0.5);
  vec2 toCenter = vUv - center;
  float dist = length(toCenter);

  vec2 dir = toCenter / max(dist, 0.0001);
  float amt = uAberration * dist * dist;
  float r = texture2D(tDiffuse, vUv - dir * amt).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv + dir * amt).b;
  vec3 color = vec3(r, g, b);

  float vig = smoothstep(0.95, 0.35, dist);
  color *= mix(0.82, 1.0, vig);

  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  float dirt = 0.0;
  dirt += smudge(vUv, vec2(0.28, 0.64), 0.22, 0.28) * 0.5;
  dirt += smudge(vUv, vec2(0.70, 0.22), 0.16, 0.24) * 0.4;
  dirt += smudge(vUv, vec2(0.82, 0.78), 0.12, 0.20) * 0.35;
  color += dirt * uDirtIntensity * luma * vec3(1.0, 0.92, 0.8);

  gl_FragColor = vec4(color, 1.0);
}
`;

/* ─── Particle explosion (uProgress ≈ 0.94 → 1.0) ───────────────────────────
 * A single THREE.Points cloud, GPU-driven (no per-frame CPU simulation):
 * each particle spawns at a random point on the sphere's surface and flies
 * radially outward as uBurst (a smoothstep band near the very end of the
 * scroll) rises, fading in then back out — "no white flash", just an
 * orange→gold energy release consistent with the sun-stage palette. */
const PARTICLE_VERTEX = /* glsl */ `
attribute float aSeed;
uniform float uBurst;
uniform float uTime;
varying float vAlpha;
varying float vSeed;

void main() {
  vSeed = aSeed;
  vec3 dir = normalize(position);
  float travel = uBurst * (2.2 + aSeed * 2.2);
  vec3 wobble = vec3(
    sin(uTime * 3.0 + aSeed * 40.0),
    cos(uTime * 2.4 + aSeed * 30.0),
    sin(uTime * 2.8 + aSeed * 20.0)
  ) * 0.10 * uBurst;
  vec3 displaced = position + dir * travel + wobble;

  vAlpha = smoothstep(0.0, 0.10, uBurst) * (1.0 - smoothstep(0.5, 1.0, uBurst));

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_PointSize = (6.0 + aSeed * 16.0) * vAlpha * (240.0 / max(-mvPosition.z, 0.001));
  gl_Position = projectionMatrix * mvPosition;
}
`;

const PARTICLE_FRAGMENT = /* glsl */ `
varying float vAlpha;
varying float vSeed;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float soft = smoothstep(0.5, 0.0, d);
  if (soft <= 0.0 || vAlpha <= 0.0) discard;

  vec3 orange = vec3(1.0, 0.45, 0.08);
  vec3 gold   = vec3(1.0, 0.78, 0.35);
  vec3 color = mix(orange, gold, vSeed);

  gl_FragColor = vec4(color * soft * 1.6, soft * vAlpha);
}
`;

/* ─── Component ─────────────────────────────────────────────────────────── */
export function Planet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── Deferred disposal refs ────────────────────────────────────────── */
    let mounted = true;
    let rafId   = 0;
    const toDispose: Array<{ dispose(): void }> = [];
    let killScrollTrigger:  (() => void) | null = null;
    let killResizeObserver: (() => void) | null = null;
    let disposeRenderer:    (() => void) | null = null;
    let disposeKTX2Loader:  (() => void) | null = null;

    /* ── Async bootstrap ───────────────────────────────────────────────── */
    async function init() {
      const [
        THREE,
        { default: gsap },
        { ScrollTrigger },
        { EffectComposer },
        { RenderPass },
        { UnrealBloomPass },
        { ShaderPass },
        { OutputPass },
        { SavePass },
        { FXAAShader },
        { KTX2Loader },
      ] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("three/examples/jsm/postprocessing/EffectComposer.js"),
        import("three/examples/jsm/postprocessing/RenderPass.js"),
        import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
        import("three/examples/jsm/postprocessing/ShaderPass.js"),
        import("three/examples/jsm/postprocessing/OutputPass.js"),
        import("three/examples/jsm/postprocessing/SavePass.js"),
        import("three/examples/jsm/shaders/FXAAShader.js"),
        import("three/examples/jsm/loaders/KTX2Loader.js"),
      ]);

      if (!mounted || !canvas) return;
      gsap.registerPlugin(ScrollTrigger);

      /* ─── Renderer ───────────────────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias:       window.devicePixelRatio < 2,
        alpha:           true,
        powerPreference: "high-performance",
        precision:       "highp",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
      renderer.setClearAlpha(0);
      renderer.outputColorSpace    = THREE.SRGBColorSpace;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const W = canvas.offsetWidth  || 800;
      const H = canvas.offsetHeight || 800;
      renderer.setSize(W, H, false);

      disposeRenderer = () => renderer.dispose();

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

      /* ─── Scene / Camera — fixed for the whole lifetime, no controls ───── */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
      camera.position.set(0, 0, CAMERA_Z);
      camera.lookAt(0, 0, 0);

      /* ─── Tier — resolved once at boot ─────────────────────────────────── */
      const tier = getTier(window.innerWidth);
      const wantsDisplacement = tier !== "mobile";
      const wantsCorona = tier !== "mobile";

      /* ─── Texture loading (lazy — only after idle, see bottom) ───────────
       * KTX2 (Basis Universal) instead of WebP: transcoded straight to a
       * GPU-native compressed format (BC7/ASTC/ETC2/... depending on what
       * the device supports, resolved by detectSupport()), so these upload
       * to the GPU already compressed instead of being decoded to a full
       * RGBA bitmap first — smaller download AND smaller GPU memory
       * footprint, which is the point on a scene with this many maps.
       * setTranscoderPath (not setDecoderPath, which is DRACOLoader's
       * geometry-decoder method — KTX2Loader's texture transcoder uses this
       * name) points at three.js's own CDN-hosted transcoder bundle so the
       * .wasm/.js transcoder files never need to live in this repo; pinned
       * to the exact three version in package.json to avoid any API drift
       * between the local three.js build and the fetched transcoder. */
      const ktx2Loader = new KTX2Loader()
        .setTranscoderPath("https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/basis/")
        .detectSupport(renderer);

      const [
        colorTex, normalTex, roughTex, aoTex,
        crystalTex, lavaTex, sunTex, atmTex,
        dispTexLoaded, coronaTex,
      ] = await Promise.all([
        ktx2Loader.loadAsync("/textures/planet/color.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/normal.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/roughness.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/ao.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/crystal.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/lava.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/sun.ktx2"),
        ktx2Loader.loadAsync("/textures/planet/atmosphere.ktx2"),
        wantsDisplacement ? ktx2Loader.loadAsync("/textures/planet/displacement.ktx2") : Promise.resolve(null),
        wantsCorona ? ktx2Loader.loadAsync("/textures/planet/corona.ktx2") : Promise.resolve(null),
      ]);

      /* The loader's worker pool / transcoder module isn't needed once every
       * texture has been transcoded — release it now rather than waiting
       * for unmount, and again in cleanup in case the component unmounts
       * before we get here. */
      disposeKTX2Loader = () => ktx2Loader.dispose();

      if (!mounted) {
        disposeKTX2Loader();
        return;
      }
      disposeKTX2Loader();

      /* Mobile: skip the displacement fetch and reuse colorTex as an inert
       * filler for the sampler slot — uDisplacementScale is 0 on mobile so
       * its contents are never actually read into the final position. */
      const heightTex = dispTexLoaded ?? colorTex;

      /* Perceptual (sRGB) maps vs. linear data maps */
      colorTex.colorSpace   = THREE.SRGBColorSpace;
      crystalTex.colorSpace = THREE.SRGBColorSpace;
      lavaTex.colorSpace    = THREE.SRGBColorSpace;
      sunTex.colorSpace     = THREE.SRGBColorSpace;

      /* Seamless horizontal wrap (source textures were pre-processed with a
       * cross-faded edge band); vertical clamp so poles never wrap/stretch.
       *
       * generateMipmaps is intentionally NOT forced on here (it was under
       * the old WebP/TextureLoader path). These are now GPU block-compressed
       * CompressedTexture instances — WebGL cannot generate mipmaps for
       * compressed internal formats at runtime; a mip chain has to already
       * be baked into the .ktx2 file. CompressedTexture already defaults
       * generateMipmaps to false, which is correct here. Forcing a mipmap
       * minFilter on a texture that has no baked mip levels renders solid
       * black (an "incomplete texture" in WebGL terms), so the filter is
       * chosen based on how many levels actually transcoded in. */
      [colorTex, normalTex, roughTex, aoTex, crystalTex, lavaTex, sunTex, dispTexLoaded]
        .filter((t): t is InstanceType<typeof THREE.CompressedTexture> => t !== null)
        .forEach((t) => {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.ClampToEdgeWrapping;
          t.anisotropy = maxAnisotropy;
          const hasMipmaps = Array.isArray(t.mipmaps) && t.mipmaps.length > 1;
          t.minFilter = hasMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
          t.magFilter = THREE.LinearFilter;
        });

      /* Register every distinct loaded texture for disposal (colorTex only
       * once, even though heightTex may alias it on mobile). */
      const uniqueTextures = new Set<InstanceType<typeof THREE.Texture>>([
        colorTex, normalTex, roughTex, aoTex, crystalTex, lavaTex, sunTex, atmTex,
      ]);
      if (dispTexLoaded) uniqueTextures.add(dispTexLoaded);
      if (coronaTex) uniqueTextures.add(coronaTex);
      uniqueTextures.forEach((t) => toDispose.push(t));

      /* ─── Planet geometry + custom ShaderMaterial ──────────────────────── */
      const segments = SEGMENTS[tier];
      const geo = new THREE.SphereGeometry(SPHERE_RADIUS, segments, segments);

      const uniforms = {
        uProgress:          { value: 0 },
        uTime:               { value: 0 },
        uExposure:           { value: 1.15 },
        uHeightMap:          { value: heightTex },
        uDisplacementScale:  { value: DISPLACEMENT_SCALE[tier] },
        uInflateAmount:      { value: INFLATE_AMOUNT[tier] },
        uTurbulenceAmount:   { value: TURBULENCE_AMOUNT[tier] },
        uColorMap:           { value: colorTex },
        uNormalMap:          { value: normalTex },
        uRoughnessMap:       { value: roughTex },
        uAoMap:              { value: aoTex },
        uCrystalMap:         { value: crystalTex },
        uLavaMap:            { value: lavaTex },
        uSunMap:             { value: sunTex },
        uAmbientColor:       { value: new THREE.Color(BRAND_DEEP).multiplyScalar(1.4) },
        uKeyLightDir:        { value: new THREE.Vector3(-4, 3, 5).normalize() },
        uKeyLightColor:      { value: new THREE.Color(0xfff0e0) },
        uRimColor:           { value: new THREE.Color(RIM_BLUE) },
        uNormalStrength:     { value: NORMAL_STRENGTH[tier] },
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
      });

      const planet = new THREE.Mesh(geo, mat);
      toDispose.push(geo, mat);

      /* ─── World-space group ──────────────────────────────────────────────
       * Everything that makes up "the planet" (sphere, atmosphere, corona,
       * particles) lives inside ONE Group so it can be positioned/scaled as
       * a single rigid object in 3D space — never as a DOM-sized/cropped
       * element. Only position + uniform scale are ever applied to this
       * group; rotation stays on the individual meshes (planet/atm spin at
       * slightly different rates, corona stays a flat camera-facing plane),
       * so nesting everything here doesn't change any of that existing
       * behaviour. See updateGroupTransform() below for the frustum math
       * that keeps this sized/positioned correctly across every viewport. */
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);
      planetGroup.add(planet);

      /* ─── Atmosphere shell ───────────────────────────────────────────────
       * Kept as a plain additive-blended MeshBasicMaterial shell (unchanged
       * mechanism from before) — its colour and scale are updated every
       * frame in JS below: blue atmosphere at progress 0, fading into an
       * orange solar glow, swelling into a "corona" scale near progress 1. */
      const atmGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 1.02, 96, 96);
      const atmMat = new THREE.MeshBasicMaterial({
        map:         atmTex,
        color:       new THREE.Color(ATM_BLUE),
        transparent: true,
        opacity:     0.5,
        blending:    THREE.AdditiveBlending,
        side:        THREE.BackSide,
        depthWrite:  false,
      });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      planetGroup.add(atm);
      toDispose.push(atmGeo, atmMat);

      /* ─── Solar corona — camera-facing glow plane, desktop/tablet only ───
       * The camera never moves (position fixed at boot, no controls), so a
       * static-facing plane (default PlaneGeometry already faces +Z, toward
       * the camera) is sufficient — no per-frame billboard math needed. */
      let corona: InstanceType<typeof THREE.Mesh> | null = null;
      let coronaMat: InstanceType<typeof THREE.MeshBasicMaterial> | null = null;
      if (coronaTex) {
        const coronaGeo = new THREE.PlaneGeometry(SPHERE_RADIUS * 2.6, SPHERE_RADIUS * 2.6);
        coronaMat = new THREE.MeshBasicMaterial({
          map:         coronaTex,
          transparent: true,
          opacity:     0,
          blending:    THREE.AdditiveBlending,
          side:        THREE.DoubleSide,
          depthWrite:  false,
        });
        corona = new THREE.Mesh(coronaGeo, coronaMat);
        corona.position.z = 0.15;
        planetGroup.add(corona);
        toDispose.push(coronaGeo, coronaMat);
      }

      /* ─── Particle explosion — child of the planet mesh so it inherits
       * the same scroll-driven rotation for free ────────────────────────── */
      const particleCount = PARTICLE_COUNT[tier];
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSeeds = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = SPHERE_RADIUS * (1.0 + Math.random() * 0.04);
        particlePositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = r * Math.cos(phi);
        particleSeeds[i] = Math.random();
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      particleGeo.setAttribute("aSeed", new THREE.BufferAttribute(particleSeeds, 1));
      const particleUniforms = {
        uBurst: { value: 0 },
        uTime:  { value: 0 },
      };
      const particleMat = new THREE.ShaderMaterial({
        vertexShader:   PARTICLE_VERTEX,
        fragmentShader: PARTICLE_FRAGMENT,
        uniforms:       particleUniforms,
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      planet.add(particles);
      toDispose.push(particleGeo, particleMat);

      /* ─── Frustum-based world-space transform ────────────────────────────
       * Sizes and positions planetGroup purely from the camera's fixed FOV/
       * distance and the current viewport's aspect ratio — never from CSS,
       * never from a container's box. At depth CAMERA_Z (the group always
       * sits at world z = 0, camera fixed at z = CAMERA_Z looking at the
       * origin), the frustum's world-space width/height are exact functions
       * of vFOV and aspect, so a target "% of viewport" size/position can be
       * solved for directly instead of approximated. Re-run on every resize
       * (see ResizeObserver below) since aspect changes with the viewport,
       * not just on tier boundaries. */
      const vFOV = THREE.MathUtils.degToRad(FOV);
      function updateGroupTransform(w: number, h: number) {
        const aspect = w / h;
        const frustumHalfHeight = CAMERA_Z * Math.tan(vFOV / 2);
        const frustumHeight = frustumHalfHeight * 2;
        const frustumHalfWidth = frustumHalfHeight * aspect;
        const frustumWidth = frustumHalfWidth * 2;

        let worldDiameter = SIZE_FRAC_WIDTH[tier] * frustumWidth;
        if (tier === "mobile") {
          // Portrait guard: don't let a width-fraction sizing blow the
          // sphere up to a huge fraction of a tall, narrow viewport.
          worldDiameter = Math.min(worldDiameter, MOBILE_HEIGHT_CAP * frustumHeight);
        }
        planetGroup.scale.setScalar(worldDiameter / (SPHERE_RADIUS * 2));

        const ndcX = CENTER_X_FRAC[tier] * 2 - 1;
        planetGroup.position.x = ndcX * frustumHalfWidth;
      }
      updateGroupTransform(W, H);

      /* ─── Post-processing pipeline (EffectComposer, tiered) ─────────────
       * Linear-HDR render target so UnrealBloomPass can extract genuine
       * above-1.0 emissive brightness; OutputPass applies the single
       * correct ACES + sRGB conversion at the end of the chain. */
      const renderTarget = new THREE.WebGLRenderTarget(W, H, {
        type:       THREE.HalfFloatType,
        colorSpace: THREE.NoColorSpace,
        samples:    WANTS_MSAA[tier] ? 8 : 0,
      });
      const composer = new EffectComposer(renderer, renderTarget);
      composer.setSize(W, H);

      const renderPass = new RenderPass(scene, camera);
      renderPass.clearAlpha = 0;
      composer.addPass(renderPass);

      /* Snapshot the CLEAN alpha (sphere silhouette + additive atmosphere/
       * corona/particle build-up, transparent everywhere else) right after
       * the base scene render and before bloom gets anywhere near it.
       * needsSwap = false (SavePass's own default) means this is a pure
       * side-tap — it does not consume or alter the main ping-pong chain
       * that bloom/heat-distortion/output/FXAA continue to operate on. */
      const savePass = new SavePass();
      composer.addPass(savePass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(W, H),
        BLOOM_STRENGTH[tier],
        BLOOM_RADIUS[tier],
        BLOOM_THRESHOLD[tier],
      );
      composer.addPass(bloomPass);

      let heatDistortionPass: InstanceType<typeof ShaderPass> | null = null;
      if (WANTS_HEAT_DISTORTION[tier]) {
        heatDistortionPass = new ShaderPass({
          uniforms: {
            tDiffuse:   { value: null },
            uTime:      { value: 0 },
            uIntensity: { value: 0 },
          },
          vertexShader:   PASSTHROUGH_VERTEX,
          fragmentShader: HEAT_DISTORTION_FRAGMENT,
        });
        composer.addPass(heatDistortionPass);
      }

      const outputPass = new OutputPass();
      composer.addPass(outputPass);

      let finalCompositePass: InstanceType<typeof ShaderPass> | null = null;
      if (WANTS_FINAL_COMPOSITE[tier]) {
        finalCompositePass = new ShaderPass({
          uniforms: {
            tDiffuse:       { value: null },
            uAberration:    { value: 0.003 },
            uDirtIntensity: { value: 0.3 },
          },
          vertexShader:   PASSTHROUGH_VERTEX,
          fragmentShader: FINAL_COMPOSITE_FRAGMENT,
        });
        composer.addPass(finalCompositePass);
      }

      let fxaaPass: InstanceType<typeof ShaderPass> | null = null;
      if (WANTS_FXAA[tier]) {
        fxaaPass = new ShaderPass(FXAAShader);
        const pr = renderer.getPixelRatio();
        (fxaaPass.material.uniforms["resolution"].value as InstanceType<typeof THREE.Vector2>)
          .set(1 / (W * pr), 1 / (H * pr));
        composer.addPass(fxaaPass);
      }

      /* ─── Alpha restore — MUST be the literal last pass, on every tier ───
       * UnrealBloomPass's internal blur/composite shaders hardcode alpha to
       * 1.0 and additively blend a full-screen quad every frame, which
       * saturates the whole canvas's alpha to ~1 regardless of content —
       * without this, the "decorative transparent canvas" turns into an
       * opaque rectangle (confirmed by inspecting UnrealBloomPass's own
       * source). This pass keeps whatever RGB the chain produced and
       * replaces only the alpha channel with the clean savePass snapshot,
       * so the canvas is genuinely transparent everywhere except where the
       * sphere/atmosphere/corona/particles actually drew something — on
       * mobile and tablet too, since bloom (and therefore this corruption)
       * runs on every tier. */
      const alphaRestorePass = new ShaderPass({
        uniforms: {
          tDiffuse:   { value: null },
          tAlphaMask: { value: savePass.renderTarget.texture },
        },
        vertexShader:   PASSTHROUGH_VERTEX,
        fragmentShader: ALPHA_RESTORE_FRAGMENT,
      });
      composer.addPass(alphaRestorePass);

      /* EffectComposer.dispose() only frees its own render targets +
       * internal copyPass — it does NOT cascade into passes added via
       * addPass() (verified against three.js's own source). Each pass that
       * owns real GPU resources (materials, and for bloom/SavePass, extra
       * internal render targets) must be disposed explicitly. RenderPass
       * holds no resources of its own (just scene/camera references) so
       * it's intentionally omitted. */
      toDispose.push(composer, bloomPass, outputPass, savePass, alphaRestorePass);
      if (heatDistortionPass) toDispose.push(heatDistortionPass);
      if (finalCompositePass) toDispose.push(finalCompositePass);
      if (fxaaPass) toDispose.push(fxaaPass);

      /* ─── GSAP ScrollTrigger — the only source of rotation AND progress ──
       * progress 0→1 maps to rotation 0→2π and to uProgress. Scrolling up
       * decreases progress and naturally reverses both — no separate
       * "reverse" branch, no idle/auto-spin, ever. */
      let targetRY       = 0;
      let currentRY      = 0;
      let targetProgress = 0;
      let currentProgress = 0;

      let handleWindowLoad: (() => void) | null = null;
      let refreshTimeouts: number[] = [];

      if (!prefersReduced) {
        const st = ScrollTrigger.create({
          start:    0,
          end:      () => ScrollTrigger.maxScroll(window),
          scrub:    true,
          onUpdate: (self) => {
            targetRY = self.progress * Math.PI * 2;
            targetProgress = self.progress;
          },
        });
        ScrollTrigger.refresh();

        /*
         * Bug fix: on mobile the planet would stop rotating partway down
         * the page. Root cause — `end` is re-evaluated only when
         * ScrollTrigger recalculates (window resize or an explicit
         * .refresh()), never automatically when the DOCUMENT gets taller
         * without a viewport resize (e.g. below-the-fold images or web
         * fonts finishing load on a slow mobile connection, after our
         * idle-deferred init already ran and captured maxScroll too early).
         * Once the page grows past that stale maxScroll, progress clamps
         * at 1 and the planet visibly freezes in its final state for the
         * rest of the scroll. Re-running refresh() after full load, plus a
         * couple of delayed fallbacks for late client-rendered content,
         * fixes it without needing every other component to know about
         * this ScrollTrigger instance.
         */
        handleWindowLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", handleWindowLoad);
        refreshTimeouts = [
          window.setTimeout(() => ScrollTrigger.refresh(), 800),
          window.setTimeout(() => ScrollTrigger.refresh(), 2500),
        ];

        killScrollTrigger = () => {
          st.kill();
          if (handleWindowLoad) window.removeEventListener("load", handleWindowLoad);
          refreshTimeouts.forEach((id) => window.clearTimeout(id));
        };
      }

      /* ─── Render loop ───────────────────────────────────────────────────
       * Rim colour and atmosphere/corona state are all continuous functions
       * of the same lerped currentProgress, so lighting, glow and geometry
       * all evolve together rather than as separate disjointed timelines. */
      const rimBlue      = new THREE.Color(RIM_BLUE);
      const rimViolet    = new THREE.Color(BRAND_VIOLET);
      const rimOrange    = new THREE.Color(RIM_ORANGE);
      const rimTmp       = new THREE.Color();
      const atmBlueCol   = new THREE.Color(ATM_BLUE);
      const atmOrangeCol = new THREE.Color(ATM_ORANGE);
      const atmTarget    = new THREE.Color();
      const clock = new THREE.Clock();

      /* ─── Site-wide colour sync ───────────────────────────────────────────
       * The same rim-colour ramp that lights the planet also drives the
       * public site's shared design tokens (--accent-gold and friends,
       * --glow-violet/--glow-blue) so buttons, borders, icons and the global
       * ambient background glow all track the planet's current narrative
       * stage. This only ever touches document.documentElement while THIS
       * component is mounted — Planet only renders inside the (site) route
       * group, so /dashboard and /login never see it move, and the cleanup
       * below removes every override on unmount so a client-side navigation
       * away from a site page can't leave a stale colour behind. */
      const cssRoot = document.documentElement.style;
      const white       = new THREE.Color(0xffffff);
      const hoverTmp     = new THREE.Color();
      const textTmp      = new THREE.Color();
      const glowBlueTmp  = new THREE.Color();

      function toSRGBChannels(c: InstanceType<typeof THREE.Color>) {
        const hex = c.getHexString(THREE.SRGBColorSpace);
        return {
          hex: `#${hex}`,
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        };
      }

      function tick() {
        if (!mounted) return;
        rafId = requestAnimationFrame(tick);

        const elapsed = clock.getElapsedTime();

        currentRY += (targetRY - currentRY) * LERP_FACTOR;
        currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;

        planet.rotation.y = currentRY;
        atm.rotation.y = currentRY * 0.92;

        uniforms.uProgress.value = currentProgress;
        uniforms.uTime.value = elapsed;

        if (currentProgress < 0.5) {
          rimTmp.lerpColors(rimBlue, rimViolet, currentProgress / 0.5);
        } else {
          rimTmp.lerpColors(rimViolet, rimOrange, (currentProgress - 0.5) / 0.5);
        }
        uniforms.uRimColor.value.copy(rimTmp);

        /* Site-wide tokens: same rim colour, two lighter derived tints
         * (hover / text) matching the existing static ratios in globals.css
         * (#7c3aed → #8b5cf6 hover, → #b39dfa text), plus the two glow tones
         * consumed by the global ambient background layer. */
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

        /* Atmosphere: blue → orange, growing into a corona near the end */
        const atmT = THREE.MathUtils.smoothstep(currentProgress, 0.15, 0.75);
        atmTarget.lerpColors(atmBlueCol, atmOrangeCol, atmT);
        atmMat.color.copy(atmTarget);
        const coronaGrowth = THREE.MathUtils.smoothstep(currentProgress, 0.75, 1.0);
        atm.scale.setScalar(1 + coronaGrowth * 0.35);
        atmMat.opacity = THREE.MathUtils.lerp(0.35, 0.6, atmT) + coronaGrowth * 0.15;

        if (corona && coronaMat) {
          const coronaVis = THREE.MathUtils.smoothstep(currentProgress, 0.82, 1.0);
          coronaMat.opacity = coronaVis * 0.85;
          corona.scale.setScalar(1 + coronaVis * 0.6);
        }

        const exposure = 1.15 + coronaGrowth * 0.35;
        renderer.toneMappingExposure = exposure;
        uniforms.uExposure.value = exposure;

        /* Particle explosion burst, driven by the same progress timeline —
         * only ever active in the last ~6% of the scroll. */
        const burst = THREE.MathUtils.smoothstep(currentProgress, 0.94, 1.0);
        particleUniforms.uBurst.value = burst;
        particleUniforms.uTime.value = elapsed;

        /* Bloom intensifies toward the explosion; heat-distortion ramps
         * with the lava/sun stages (mirrors the shader's own wLava+wSun
         * bands via the same smoothstep on currentProgress). */
        bloomPass.strength = BLOOM_STRENGTH[tier] * (1 + coronaGrowth * 0.5);
        if (heatDistortionPass) {
          const heatT = THREE.MathUtils.smoothstep(currentProgress, 0.45, 0.85);
          heatDistortionPass.uniforms.uIntensity.value = heatT;
          heatDistortionPass.uniforms.uTime.value = elapsed;
        }
        if (finalCompositePass) {
          finalCompositePass.uniforms.uAberration.value = THREE.MathUtils.lerp(0.002, 0.01, coronaGrowth);
        }

        composer.render();
      }
      rafId = requestAnimationFrame(tick);

      /* ─── ResizeObserver — keep canvas / camera / composer in sync ──────── */
      const ro = new ResizeObserver(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        updateGroupTransform(w, h);
        composer.setSize(w, h);
        if (fxaaPass) {
          const pr = renderer.getPixelRatio();
          (fxaaPass.material.uniforms["resolution"].value as InstanceType<typeof THREE.Vector2>)
            .set(1 / (w * pr), 1 / (h * pr));
        }
      });
      ro.observe(canvas);
      killResizeObserver = () => ro.disconnect();
    }

    /*
     * Defer the heavy bootstrap until the browser is idle, so it never
     * competes with the hero's first paint / LCP. Falls back to a short
     * timeout on browsers without requestIdleCallback (Safari).
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
      // Defensive/idempotent — init() already disposes the KTX2 loader's
      // worker pool as soon as textures resolve; this only matters if
      // unmount happens before that point is ever reached.
      disposeKTX2Loader?.();

      /* Release the shared design-token overrides so a client-side
       * navigation to /dashboard or /login (same <html>, no full reload)
       * falls back to the static brand violet defined in globals.css
       * instead of freezing on whatever colour the planet last showed. */
      const root = document.documentElement.style;
      [
        "--accent-gold", "--accent-gold-rgb", "--accent-gold-hover",
        "--accent-gold-text", "--glow-violet", "--glow-blue",
      ].forEach((prop) => root.removeProperty(prop));
    };
  }, []);

  /*
   * Canvas positioning — genuinely global, not a section decoration:
   *   · Fixed to the full viewport (top:0, left:0, 100vw/100vh) — not a
   *     small box cropped to a corner. No wrapper, no max-width, no
   *     overflow rule, no container the planet could ever be clipped by.
   *   · The planet's on-screen size/position come entirely from the 3D
   *     world-space transform computed in updateGroupTransform() above,
   *     not from CSS — this canvas is just a full-bleed viewport onto the
   *     one scene that persists for the whole site.
   *   · pointer-events: none — the canvas never blocks page interaction.
   *
   * The z-index (-1) matches the star canvas. Because <Planet> is rendered
   * BEFORE <SpaceBackground> in the layout, the stars canvas (later in DOM)
   * paints on top of this canvas — stars appear in front of the planet.
   */
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
