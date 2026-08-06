"use client";

/*
 * ─── ktx2-loader.ts ──────────────────────────────────────────────────────
 * Thin helper around three.js's KTX2Loader (Basis Universal) so Planet.tsx
 * doesn't hand-roll transcoder setup/cleanup. Same approach that was proven
 * out and fixed in the old system, kept here as a reusable module instead
 * of inline code: setTranscoderPath points at three's own jsdelivr-hosted
 * transcoder build (pinned to package.json's three version so the fetched
 * .wasm/.js never drifts from the local three.js API), detectSupport(
 * renderer) lets the loader pick the best GPU-native compressed format the
 * device actually supports at transcode time (BC7/ASTC/ETC2/...).
 *
 * Mip-safety: CompressedTexture defaults generateMipmaps to false and WebGL
 * cannot generate mipmaps for block-compressed formats at runtime — a mip
 * chain has to already be baked into the .ktx2 file (see the --genmipmap
 * flag used when encoding). Forcing a mipmap filter on a texture with no
 * baked levels renders solid black, so the filter is chosen based on how
 * many levels actually transcoded in, per texture.
 *
 * Transcoder path: prefers self-hosted /basis/ (audit du 6 août 2026,
 * point 5 — removes a third-party origin, one less DNS+TLS round trip,
 * addresses Lighthouse "Réduisez et différez le chargement du code
 * tiers"). Place basis_transcoder.js + basis_transcoder.wasm from
 * https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/basis/
 * into public/basis/ (see chat for the exact download commands).
 * resolveTranscoderPath() below checks the local file actually exists
 * first and falls back to the jsDelivr CDN otherwise — safe to deploy
 * immediately, before or after the files are added.
 */

import type * as THREE_NS from "three";

export type TextureMap = Record<string, InstanceType<typeof THREE_NS.CompressedTexture>>;

const LOCAL_TRANSCODER_PATH = "/basis/";
const CDN_TRANSCODER_PATH   = "https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/basis/";

/* HEAD-checks the self-hosted transcoder before committing to it — if the
 * files haven't been added to public/basis/ yet (see file header), this
 * silently falls back to the jsDelivr CDN instead of failing to load the
 * planet's textures entirely. */
async function resolveTranscoderPath(): Promise<string> {
  try {
    const res = await fetch(`${LOCAL_TRANSCODER_PATH}basis_transcoder.js`, { method: "HEAD" });
    return res.ok ? LOCAL_TRANSCODER_PATH : CDN_TRANSCODER_PATH;
  } catch {
    return CDN_TRANSCODER_PATH;
  }
}

export async function loadKTX2Textures(
  THREE: typeof THREE_NS,
  renderer: InstanceType<typeof THREE_NS.WebGLRenderer>,
  sources: Record<string, string>,
): Promise<{ textures: TextureMap; dispose: () => void }> {
  const { KTX2Loader } = await import("three/examples/jsm/loaders/KTX2Loader.js");

  const transcoderPath = await resolveTranscoderPath();
  const loader = new KTX2Loader()
    .setTranscoderPath(transcoderPath)
    .detectSupport(renderer);

  const entries = Object.entries(sources);
  const loaded = await Promise.all(entries.map(([, url]) => loader.loadAsync(url)));

  const textures: TextureMap = {};
  entries.forEach(([key], i) => {
    const tex = loaded[i];
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    const hasMipmaps = Array.isArray(tex.mipmaps) && tex.mipmaps.length > 1;
    tex.minFilter = hasMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    textures[key] = tex;
  });

  // The loader's worker pool / transcoder module isn't needed once every
  // texture has been transcoded — release it immediately rather than
  // waiting for the component to unmount.
  loader.dispose();

  return {
    textures,
    dispose: () => {
      Object.values(textures).forEach((t) => t.dispose());
    },
  };
}
