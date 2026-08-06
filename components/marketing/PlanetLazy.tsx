"use client";

/*
 * ─── PlanetLazy.tsx ──────────────────────────────────────────────────────
 * Thin client-only wrapper around <Planet /> so its own JS chunk (plus
 * everything it statically imports) is code-split out of the app's initial/
 * shared bundle instead of being fetched and parsed on every page load.
 *
 * next/dynamic's { ssr: false } option can't be called directly inside
 * app/(site)/layout.tsx because that file is a Server Component — Next.js
 * throws a build error ("ssr: false is not allowed with next/dynamic in
 * Server Components") if you try. Routing the dynamic import through this
 * dedicated "use client" file is the standard workaround: layout.tsx does a
 * normal static import of THIS file (cheap — it's just the dynamic() call
 * below), and the actual Planet component (three.js/gsap/EffectComposer and
 * all) only gets fetched once this wrapper mounts on the client, well after
 * the initial HTML/JS needed for first paint has already loaded.
 *
 * loading: () => null means there's no placeholder — correct here since
 * Planet is a fully decorative, pointer-events-none background layer with
 * no layout impact (position: fixed), so there's nothing to reserve space
 * for and no risk of CLS while the chunk streams in.
 */

import dynamic from "next/dynamic";

const Planet = dynamic(() => import("./Planet").then((mod) => mod.Planet), {
  ssr: false,
  loading: () => null,
});

export default Planet;
