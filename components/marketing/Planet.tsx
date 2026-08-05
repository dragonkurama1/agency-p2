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
 * Scope note: this stays a persistent, non-blocking decorative element (same
 * position/behaviour as before — fixed on the right, ~40% off-screen,
 * pointer-events: none, visible through the whole page scroll). It does NOT
 * take over the viewport or gate the rest of the site behind an intro
 * sequence, and it does NOT use a post-processing pipeline (Bloom/FXAA/
 * chromatic aberration/heat-distortion passes) — bloom-like brightness is
 * approximated with a hand-rolled ACES tonemap + rising exposure uniform,
 * which gets the "getting hot" cinematic read without the GPU/perf cost of
 * EffectComposer. This trade-off was chosen explicitly to keep the element
 * decorative rather than a full-page takeover, and to protect the Lighthouse
 * perf work already done on this page (22MB → ~2MB, 21s TBT → idle-deferred).
 *
 * Folder structure (existing project architecture, nothing new added):
 *   components/marketing/Planet.tsx   ← this file (shaders inlined below)
 *   public/textures/planet/*.webp     ← 10 PBR/narrative maps (compressed, seamless)
 *   app/(site)/layout.tsx             ← mounts <Planet /> globally
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ─── Tuning constants ──────────────────────────────────────────────────── */
const SPHERE_RADIUS   = 4;
const CAMERA_Z        = 10.5;
const FOV             = 44;          // degrees
const LERP_FACTOR     = 0.08;        // scroll-rotation / scroll-progress smoothing
const PIXEL_RATIO_CAP = 2;           // GPU memory guard
const TRANSLATE_X_PCT = 34;          // % of canvas pushed off-screen to the right

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
  mobile:  96,
  tablet:  256,
  desktop: 512,
};

const DISPLACEMENT_SCALE: Record<Tier, number> = {
  mobile:  0,
  tablet:  0.09,
  desktop: 0.12,
};

const INFLATE_AMOUNT: Record<Tier, number> = {
  mobile:  0,
  tablet:  0.04,
  desktop: 0.06,
};

const TURBULENCE_AMOUNT: Record<Tier, number> = {
  mobile:  0,
  tablet:  0.08,
  desktop: 0.14,
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
 * Tonemap: this material writes its own ACES-filmic + linear-to-sRGB encode
 * at the very end (see acesFilmic/linearToSRGB) rather than relying on
 * three.js's auto-injected chunk system, since that system only reliably
 * activates for built-in materials — doing it by hand here is version-proof
 * and keeps this shader fully self-contained. uExposure is kept in lockstep
 * with renderer.toneMappingExposure from the JS side every frame, so the
 * whole scene (this shader + the plain-material atmosphere/corona) brightens
 * together as the planet becomes a sun.
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
  mat3 TBN = cotangentFrame(N, -V, uv);
  return normalize(TBN * mapN);
}

vec3 acesFilmic(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 linearToSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
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

  /* ── Procedural crack / vein mask — ridged fBm, animated ──────────────── */
  float crackNoise = fbm(vWorldPosition * 2.2 + vec3(0.0, uTime * 0.05, 0.0));
  float crackMask = pow(clamp(1.0 - abs(crackNoise), 0.0, 1.0), 6.0);

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
  float ndl = max(dot(N, normalize(uKeyLightDir)), 0.0);
  vec3 lit = uAmbientColor * ao + uKeyLightColor * ndl * ao;

  vec3 H = normalize(normalize(uKeyLightDir) + V);
  float spec = pow(max(dot(N, H), 0.0), mix(64.0, 8.0, roughness)) * (1.0 - roughness);
  lit += uKeyLightColor * spec * 0.6;

  float rimFactor = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  lit += uRimColor * rimFactor;

  /* As the surface becomes self-luminous (sun stage) external lighting
   * matters less — it should glow from within, not reflect. */
  float litFade = 1.0 - wSun * 0.92;
  vec3 finalColor = albedo * lit * litFade + emissive;

  vec3 toneMapped = acesFilmic(finalColor * uExposure);
  vec3 outputColor = linearToSRGB(toneMapped);

  gl_FragColor = vec4(outputColor, 1.0);
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

    /* ── Async bootstrap ───────────────────────────────────────────────── */
    async function init() {
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
        antialias:       window.devicePixelRatio < 2,
        alpha:           true,
        powerPreference: "high-performance",
        precision:       "highp",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, PIXEL_RATIO_CAP));
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

      /* ─── Texture loading (lazy — only after idle, see bottom) ─────────── */
      const loader = new THREE.TextureLoader();
      const [
        colorTex, normalTex, roughTex, aoTex,
        crystalTex, lavaTex, sunTex, atmTex,
        dispTexLoaded, coronaTex,
      ] = await Promise.all([
        loader.loadAsync("/textures/planet/color.webp"),
        loader.loadAsync("/textures/planet/normal.webp"),
        loader.loadAsync("/textures/planet/roughness.webp"),
        loader.loadAsync("/textures/planet/ao.webp"),
        loader.loadAsync("/textures/planet/crystal.webp"),
        loader.loadAsync("/textures/planet/lava.webp"),
        loader.loadAsync("/textures/planet/sun.webp"),
        loader.loadAsync("/textures/planet/atmosphere.webp"),
        wantsDisplacement ? loader.loadAsync("/textures/planet/displacement.webp") : Promise.resolve(null),
        wantsCorona ? loader.loadAsync("/textures/planet/corona.webp") : Promise.resolve(null),
      ]);

      if (!mounted) return;

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
       * cross-faded edge band); vertical clamp so poles never wrap/stretch. */
      [colorTex, normalTex, roughTex, aoTex, crystalTex, lavaTex, sunTex, dispTexLoaded]
        .filter((t): t is InstanceType<typeof THREE.Texture> => t !== null)
        .forEach((t) => {
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.ClampToEdgeWrapping;
          t.anisotropy = maxAnisotropy;
          t.generateMipmaps = true;
          t.minFilter = THREE.LinearMipmapLinearFilter;
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
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
      });

      const planet = new THREE.Mesh(geo, mat);
      scene.add(planet);
      toDispose.push(geo, mat);

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
      scene.add(atm);
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
        scene.add(corona);
        toDispose.push(coronaGeo, coronaMat);
      }

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

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);

      /* ─── ResizeObserver — keep canvas / camera in sync ────────────────── */
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
   * Canvas positioning:
   *   · Fixed to the right, vertically centred
   *   · translateY(-50%) centres it on the Y axis
   *   · translateX(TRANSLATE_X_PCT%) pushes it ~1/3 off-screen to the right
   *   · pointer-events: none — never blocks page interaction/content
   *
   * Size/margin use clamp() so desktop gets real breathing room instead of
   * scaling unbounded with viewport height (a 4K monitor no longer produces
   * an oversized canvas) while mobile/tablet keep the previous vh/vw-based
   * feel, since their clamp floor/ceiling rarely bind at those widths.
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
        right:         "clamp(0px, 2vw, 56px)",
        top:           "50%",
        transform:     `translateY(-50%) translateX(${TRANSLATE_X_PCT}%)`,
        pointerEvents: "none",
        zIndex:        -1,
        width:         "clamp(340px, min(112vh, 96vw), 860px)",
        height:        "clamp(340px, min(112vh, 96vw), 860px)",
      }}
    />
  );
}
