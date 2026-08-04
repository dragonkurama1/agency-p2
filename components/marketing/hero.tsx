"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { SectionContent } from "@/data/sections";

const DEFAULTS = {
  eyebrow: "Agence Marketing Digital — Casablanca",
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
  /* Parallax : fond descend légèrement au scroll */
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const subtitle =
    section?.subtitle ||
    "Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats.";
  const ctaText = section?.button_text || DEFAULTS.ctaText;
  const ctaHref = section?.button_link || DEFAULTS.ctaHref;

  return (
    <section
      ref={ref}
      className="relative -mt-20 min-h-screen overflow-hidden flex items-center"
      aria-label="Héro — Prestigia Agency"
    >
      {/* ── Fond spatial avec parallax ───────────────────────────────────── */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: bgY }}>
        <div
          className="absolute inset-0 scale-[1.15]"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            /* planet visible dès le haut du hero, côté droit */
            backgroundPosition: "right top",
            backgroundRepeat: "no-repeat",
          }}
        />
      </motion.div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {/* Gradient gauche pour lisibilité du texte */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/5" />
      {/* Gradient bas */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
      {/* Glow violet discret */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: "rgba(124,58,237,0.12)" }}
      />

      {/* ── Contenu principal ────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full"
        style={{
          y: contentY,
          maxWidth: "1600px",
          margin: "0 auto",
          paddingLeft: "70px",
          paddingRight: "70px",
          paddingTop: "140px",
          paddingBottom: "80px",
        }}
      >
        {/* Bloc texte — assez large pour accueillir les 3 lignes */}
        <div style={{ maxWidth: "1060px" }}>

          {/* Eyebrow — Montserrat Regular */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="uppercase text-[#7C3AED]"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 400,
              fontSize: "11px",
              letterSpacing: "0.45em",
              marginBottom: "20px",
            }}
          >
            {DEFAULTS.eyebrow}
          </motion.p>

          {/* H1 — Coolvetica (Bebas Neue) */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="uppercase text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontWeight: 400,
              fontSize: "clamp(58px, 5vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "-2px",
            }}
          >
            {/* Ligne 1 : NOUS CONSTRUISONS UNE */}
            Nous construisons une
            <br className="hidden lg:block" />
            {" "}
            {/* Ligne 2 : PRÉSENCE DIGITALE QUI ATTIRE, */}
            <span style={{ color: "#7C3AED" }}>présence digitale</span>{" "}
            qui attire,
            <br className="hidden lg:block" />
            {" "}
            {/* Ligne 3 : ENGAGE ET CONVERTIT. */}
            engage et convertit.
          </motion.h1>

          {/* Sous-titre — Montserrat Regular */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="text-white/65"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 400,
              fontSize: "17px",
              lineHeight: 1.4,
              marginTop: "28px",
              maxWidth: "640px",
            }}
          >
            {subtitle}
          </motion.p>

          {/* ── Boutons — juste sous le paragraphe ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: "easeOut" }}
            style={{
              marginTop: "42px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {/* Bouton principal */}
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-full bg-[#7C3AED] text-white font-semibold tracking-wide transition-all duration-300 hover:bg-[#8b5cf6] hover:shadow-[0_0_44px_rgba(124,58,237,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ padding: "14px 32px", fontSize: "14px" }}
            >
              {ctaText}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Bouton secondaire */}
            <Link
              href={DEFAULTS.cta2Href}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 text-white font-semibold tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/10 hover:-translate-y-0.5 active:translate-y-0"
              style={{ padding: "14px 32px", fontSize: "14px" }}
            >
              {DEFAULTS.cta2Text}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
