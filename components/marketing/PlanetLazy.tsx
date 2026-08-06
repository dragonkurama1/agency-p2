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
 * loading: () => null — both variants are fully decorative,
 * pointer-events-none background layers with no layout impact (position:
 * fixed), so there's nothing to reserve space for and no risk of CLS while
 * either chunk streams in.
 *
 * Device split (audit du 6 août 2026 — testé en conditions réelles) :
 * isTouchHandheld() decides which component to dynamically import BEFORE
 * either import() call runs — on a touch/small-screen device, Planet's
 * factory function is simply never invoked, so three.js/GSAP never get
 * fetched, parsed, or executed at all, not just "rendered less". The
 * decision happens client-side after mount (matching the rest of this
 * module's client-only pattern) to avoid any SSR/hydration mismatch;
 * nothing visible renders until it resolves, same as the previous
 * single-variant loading:()=>null behaviour.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isTouchHandheld } from "./planet/capabilities";

const PlanetWebGL = dynamic(() => import("./Planet").then((mod) => mod.Planet), {
  ssr: false,
  loading: () => null,
});

const PlanetStatic = dynamic(
  () => import("./PlanetStaticFallback").then((mod) => mod.PlanetStaticFallback),
  { ssr: false, loading: () => null },
);

export default function PlanetLazy() {
  const [mode, setMode] = useState<"pending" | "webgl" | "static">("pending");

  useEffect(() => {
    setMode(isTouchHandheld() ? "static" : "webgl");
  }, []);

  if (mode === "pending") return null;
  return mode === "static" ? <PlanetStatic /> : <PlanetWebGL />;
}
