/*
 * ─── shaders.ts ──────────────────────────────────────────────────────────
 * The planet's surface: one ShaderMaterial, one master uProgress uniform
 * (0→1, driven by scroll — see Planet.tsx) blends the surface through
 * crystal → lava → sun as the page scrolls, each transition following a
 * noisy fbm-driven mask instead of a flat crossfade. Vertex displacement
 * uses the same fbm noise (procedural, not a height-map texture) for
 * relief — this avoids a vertex-texture-fetch dependency, which is limited
 * or slow on some older/weaker mobile GPUs, keeping one shader path that
 * behaves identically on every device instead of a texture-relief path for
 * desktop and a flat one for mobile.
 *
 * Output is manually tonemapped (ACES approximation) and sRGB-encoded at
 * the end of the fragment shader — this phase renders directly (no
 * post-processing composer yet), and three.js does not auto-apply its
 * renderer.toneMapping/outputColorSpace pipeline to raw ShaderMaterial
 * output, only to its built-in materials.
 */

export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
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

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
`;

export const VERTEX_SHADER = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform float uDisplacementScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vUv = uv;

  float n = fbm(position * 1.5 + uTime * 0.02, 4);
  vec3 displaced = position + normal * (n * uDisplacementScale);

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
${NOISE_GLSL}

uniform float uProgress;
uniform float uTime;
uniform float uExposure;
uniform sampler2D uColorMap;
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
varying vec3 vWorldPos;

vec3 acesFilmic(vec3 x) {
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec3 baseColor    = texture2D(uColorMap, vUv).rgb;
  vec3 crystalColor = texture2D(uCrystalMap, vUv).rgb;
  vec3 lavaColor    = texture2D(uLavaMap, vUv).rgb;
  vec3 sunColor     = texture2D(uSunMap, vUv).rgb;
  float roughness   = texture2D(uRoughnessMap, vUv).r;
  float ao          = texture2D(uAoMap, vUv).r;

  /* Each stage "grows" across the surface as uProgress rises through its
   * band, gated by a noisy world-space mask instead of a flat crossfade —
   * so the transition reads as veins/cracks spreading, not a dissolve. */
  float crackNoise = fbm(vWorldPos * 2.2 + uTime * 0.05, 4);

  float wCrystal = smoothstep(0.0, 0.35, uProgress) * smoothstep(0.75, 0.35, uProgress);
  float wLava    = smoothstep(0.3, 0.6, uProgress)  * smoothstep(0.95, 0.6, uProgress);
  float wSun     = smoothstep(0.65, 1.0, uProgress);

  float crystalMask = smoothstep(0.0, 0.08, crackNoise * wCrystal - (1.0 - wCrystal));
  float lavaMask    = smoothstep(0.0, 0.08, crackNoise * wLava    - (1.0 - wLava));
  float sunMask     = wSun;

  vec3 surfaceColor = baseColor;
  surfaceColor = mix(surfaceColor, crystalColor, crystalMask);
  surfaceColor = mix(surfaceColor, lavaColor, lavaMask);
  surfaceColor = mix(surfaceColor, sunColor, sunMask);

  vec3 N = normalize(vNormal);
  vec3 L = normalize(uKeyLightDir);
  float diff = max(dot(N, L), 0.0);

  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float rim = pow(1.0 - max(dot(N, viewDir), 0.0), 2.5);

  vec3 lighting = uAmbientColor * ao
                + uKeyLightColor * diff * (1.0 - roughness * 0.5)
                + uRimColor * rim * (0.4 + wSun * 1.2);

  /* Sun stage: the surface becomes its own light source. */
  vec3 emissive = sunColor * wSun * 1.8;

  vec3 finalColor = surfaceColor * lighting + emissive;

  vec3 toneMapped = acesFilmic(finalColor * uExposure);
  vec3 srgb = pow(toneMapped, vec3(1.0 / 2.2));
  gl_FragColor = vec4(srgb, 1.0);
}
`;
