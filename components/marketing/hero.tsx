"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { SectionContent } from "@/data/sections";

const DEFAULTS = {
  eyebrow: "Agence Marketing Digital — Casablanca",
  title: "Nous construisons une",
  titleHighlight: "présence digitale",
  titleEnd: "qui attire, engage et convertit.",
  subtitle:
    "Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats, pensée pour les marques qui veulent grandir.",
  ctaText: "Demander un devis",
  ctaHref: "/devis",
  cta2Text: "Voir nos réalisations",
  cta2Href: "/realisations",
};

export function Hero({ section }: { section?: SectionContent | null }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  /* Légère translation vers le bas du fond pendant le scroll = effet parallax */
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  /* Le contenu monte légèrement */
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const subtitle = section?.subtitle || DEFAULTS.subtitle;
  const ctaText = section?.button_text || DEFAULTS.ctaText;
  const ctaHref = section?.button_link || DEFAULTS.ctaHref;

  return (
    <section
      ref={ref}
      /* -mt-20 annule le pt-20 du layout (header fixed h-20) → hero plein écran */
      className="relative -mt-20 flex min-h-screen items-center overflow-hidden"
      aria-label="Héro — Prestigia Agency"
    >
      {/* ── Fond avec effet parallax ──────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: bgY }}
      >
        <div
          className="absolute inset-0 scale-[1.12]"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center right",
            backgroundRepeat: "no-repeat",
          }}
        />
      </motion.div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: "rgba(124,58,237,0.12)" }}
      />

      {/* ── Texte — côté GAUCHE ───────────────────────────────────────────── */}
      <motion.div
        className="container-px mx-auto max-w-7xl w-full pt-36 pb-32"
        style={{ y: contentY }}
      >
        <div className="max-w-[520px] lg:max-w-[50%]">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.45em] text-[#7C3AED]"
          >
            {DEFAULTS.eyebrow}
          </motion.p>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif uppercase leading-[0.92] text-white"
            style={{ fontSize: "clamp(2.8rem, 6.5vw, 6.4rem)" }}
          >
            {DEFAULTS.title}{" "}
            <span style={{ color: "#7C3AED" }}>{DEFAULTS.titleHighlight}</span>{" "}
            {DEFAULTS.titleEnd}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="mt-6 max-w-[420px] text-[15px] leading-relaxed text-white/60"
          >
            {subtitle}
          </motion.p>
        </div>
      </motion.div>

      {/* ── CTA — BAS DROITE ─────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-16 left-0 right-0"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.3, ease: "easeOut" }}
      >
        <div className="container-px mx-auto max-w-7xl flex justify-end gap-4">
          {/* Bouton principal */}
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 rounded-full bg-[#7C3AED] px-8 py-3.5 text-sm font-semibold text-white tracking-wide transition-all duration-300 hover:bg-[#8b5cf6] hover:shadow-[0_0_44px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {ctaText}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Bouton secondaire */}
          <Link
            href={DEFAULTS.cta2Href}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/10 hover:-translate-y-0.5 active:translate-y-0"
          >
            {DEFAULTS.cta2Text}
          </Link>
        </div>
      </motion.div>

      {/* ── Indicateur de scroll ─────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        aria-hidden="true"
      >
        <div className="h-8 w-px bg-gradient-to-b from-white/25 to-transparent" />
      </motion.div>
    </section>
  );
}
