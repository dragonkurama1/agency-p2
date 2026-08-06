"use client";

/*
 * ─── post-processing.ts ──────────────────────────────────────────────────
 * Optional bloom pass, only ever constructed when profile.postFX is true
 * (mid/high device profiles — see capabilities.ts). Low/reduced profiles
 * skip this module entirely and call renderer.render() directly in
 * Planet.tsx, so weaker devices pay zero cost for a feature they never use
 * — no composer, no extra draw calls, nothing imported.
 *
 * UnrealBloomPass hardcodes alpha to 1.0 in its internal blur/composite
 * shaders and additively blends full-screen quads, which saturates the
 * whole canvas's alpha to ~1 regardless of content — left unfixed, this
 * turns the canvas from "transparent except where the planet drew
 * something" into an opaque rectangle. Fix: snapshot the clean alpha right
 * after the base render (SavePass) and restore it as the very last pass
 * (AlphaRestorePass) after bloom has corrupted it.
 */

import type * as THREE_NS from "three";

const PASSTHROUGH_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

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

export async function createBloomComposer(
  THREE: typeof THREE_NS,
  renderer: InstanceType<typeof THREE_NS.WebGLRenderer>,
  scene: InstanceType<typeof THREE_NS.Scene>,
  camera: InstanceType<typeof THREE_NS.Camera>,
  width: number,
  height: number,
) {
  const [
    { EffectComposer },
    { RenderPass },
    { UnrealBloomPass },
    { ShaderPass },
    { SavePass },
    { OutputPass },
  ] = await Promise.all([
    import("three/examples/jsm/postprocessing/EffectComposer.js"),
    import("three/examples/jsm/postprocessing/RenderPass.js"),
    import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
    import("three/examples/jsm/postprocessing/ShaderPass.js"),
    import("three/examples/jsm/postprocessing/SavePass.js"),
    import("three/examples/jsm/postprocessing/OutputPass.js"),
  ]);

  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    type:       THREE.HalfFloatType,
    colorSpace: THREE.NoColorSpace,
  });
  const composer = new EffectComposer(renderer, renderTarget);
  composer.setSize(width, height);

  const renderPass = new RenderPass(scene, camera);
  renderPass.clearAlpha = 0;
  composer.addPass(renderPass);

  const savePass = new SavePass();
  composer.addPass(savePass);

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.5, 0.8);
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const alphaRestorePass = new ShaderPass({
    uniforms: {
      tDiffuse:   { value: null },
      tAlphaMask: { value: null },
    },
    vertexShader:   PASSTHROUGH_VERTEX,
    fragmentShader: ALPHA_RESTORE_FRAGMENT,
  });
  alphaRestorePass.uniforms.tAlphaMask.value = savePass.renderTarget.texture;
  composer.addPass(alphaRestorePass);

  return {
    composer,
    bloomPass,
    setSize(w: number, h: number) {
      composer.setSize(w, h);
    },
    dispose() {
      composer.dispose();
      renderTarget.dispose();
      bloomPass.dispose();
      outputPass.dispose();
      savePass.dispose();
      alphaRestorePass.dispose();
    },
  };
}
