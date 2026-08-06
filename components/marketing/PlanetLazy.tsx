"use client";

/*
 * ─── PlanetLazy.tsx ──────────────────────────────────────────────────────
 * Thin client-only wrapper so Planet.tsx's own JS chunk (plus three.js and
 * everything it imports) is code-split out of the app's initial/shared
 * bundle instead of being fetched and parsed on every page load.
 *
 * next/dynamic's { ssr: false } can't be called directly inside
 * app/(site)/layout.tsx because that file is a Server Component — Next.js
 * throws a build error if you try. Routing the dynamic import through this
 * dedicated "use client" file is the standard workaround.
 *
 * loading: () => null — Planet is a fully decorative, pointer-events-none
 * background layer with no layout impact (position: fixed), so there's
 * nothing to reserve space for and no risk of CLS while the chunk streams in.
 *
 * Mobile: nothing renders at all (demande explicite du 6 août 2026 — retirer
 * tout code 3D sur mobile, pas seulement l'alléger). isTouchHandheld()
 * decides BEFORE the import() call runs — on a touch/small-screen device,
 * Planet's factory function is never invoked, so three.js/GSAP are never
 * fetched, parsed, or executed. Decision happens client-side after mount to
 * avoid any SSR/hydration mismatch.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isTouchHandheld } from "./planet/capabilities";

const PlanetWebGL = dynamic(() => import("./Planet").then((mod) => mod.Planet), {
  ssr: false,
  loading: () => null,
});

export default function PlanetLazy() {
  const [showPlanet, setShowPlanet] = useState(false);

  useEffect(() => {
    setShowPlanet(!isTouchHandheld());
  }, []);

  return showPlanet ? <PlanetWebGL /> : null;
}
