"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { SectionContent } from "@/data/sections";

/*
 * ─── LCP fix (audit du 6 août 2026) ────────────────────────────────────
 * Le H1 ci-dessous était un <motion.h1 initial={{opacity:0}}...>. Framer
 * Motion applique ce style "initial" dès le rendu serveur — le HTML envoyé
 * au navigateur contenait donc déjà opacity:0 sur l'élément LCP, qui ne
 * devenait visible qu'après hydratation + fin de l'animation (0.75s,
 * potentiellement bien plus tard si le thread principal est occupé par le
 * rendu Canvas/WebGL d'arriere-plan). Chrome exclut un élément de la
 * liste des candidats LCP tant qu'il n'a pas d'opacité significative,
 * d'où un LCP mesuré à 21,9s sur mobile alors que le FCP était à 0,9s.
 *
 * Fix : le H1 (et l'eyebrow/sous-titre/boutons) sont maintenant de simples
 * éléments statiques, visibles immédiatement dans le HTML servi, animés
 * en CSS pur (@keyframes hero-fade-up, globals.css) qui ne dépend d'aucune
 * hydratation JS. Seul le parallax (`contentY`, un pur decalage de
 * position, jamais une opacité) reste sur un <motion.div> — il ne masque
 * jamais le contenu, donc ne peut pas retarder le LCP.
 */

const DEFAULTS = {
  eyebrow: "Agence Marketing Digital — Casablanca",
  ctaText: "Demander un devis",
  ctaHref: "/devis",
  cta2Text: "Voir nos réalisations",
  cta2Href: "/realisations",
};

type HeroProofItem = {
  label: string;
  value: string;
};

export function Hero({
  proofItems = [],
  section,
}: {
  proofItems?: HeroProofItem[];
  section?: SectionContent | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  /* Léger parallax sur le contenu texte */
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const subtitle =
    section?.subtitle ||
    "Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats.";
  const ctaText = section?.button_text || DEFAULTS.ctaText;
  const ctaHref = section?.button_link || DEFAULTS.ctaHref;

  return (
    <section
      ref={ref}
      className="relative isolate -mt-20 flex min-h-[92svh] items-center overflow-hidden"
      aria-label="Héro — Prestigia Agency"
    >
      {/* Signature visuelle hero : asset statique WebP, léger et lisible sous le texte. */}
      <div className="hero-signature-bg" aria-hidden="true" />

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {/* Gradient gauche pour lisibilité du texte */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/5" />
      {/* Gradient bas */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
      {/* Glow violet discret */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/3 -z-10 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: "rgb(var(--accent-gold-rgb) / 0.12)" }}
      />

      {/* ── Contenu principal — centré avec marges ───────────────────────── */}
      <motion.div
        className="relative z-10 w-full px-4 sm:px-6 lg:px-[70px]"
        style={{
          y: contentY,
          maxWidth: "1600px",
          margin: "0 auto",
          paddingTop: "118px",
          paddingBottom: "56px",
        }}
      >
        <div style={{ maxWidth: "860px" }}>

          {/* Eyebrow — statique + animation CSS pure (jamais gatée par l'hydratation) */}
          <p
            className="uppercase text-[var(--accent-gold-text)] hero-fade-up"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 400,
              fontSize: "11px",
              letterSpacing: "0.45em",
              marginBottom: "20px",
              animationDelay: "0s",
            }}
          >
            {DEFAULTS.eyebrow}
          </p>

          {/* H1 — élément LCP : statique, visible à 100% d'opacité dès le
              HTML servi, aucune dépendance à l'hydratation JS (voir note
              en tête de fichier). */}
          <h1
            className="hero-title uppercase text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontWeight: 400,
              fontSize: "clamp(40px, 5.6vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: 0,
            }}
          >
            Agence marketing digital premium à Casablanca pour une{" "}
            <span style={{ color: "var(--accent-gold-text)" }}>présence digitale</span>{" "}
            qui attire, engage et convertit.
          </h1>

          {/* Sous-titre */}
          <p
            className="hero-subtitle text-white/65 hero-fade-up"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 400,
              fontSize: "17px",
              lineHeight: 1.58,
              marginTop: "28px",
              maxWidth: "640px",
              animationDelay: "0.12s",
            }}
          >
            {subtitle}
          </p>

          {/* Boutons côte à côte */}
          <div
            className="hero-fade-up"
            style={{
              marginTop: "42px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              animationDelay: "0.22s",
            }}
          >
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--accent-gold)] text-white font-normal tracking-wide transition-all duration-300 hover:bg-[var(--accent-gold-hover)] hover:shadow-[0_0_44px_rgb(var(--accent-gold-rgb)/55%)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ padding: "14px 32px", fontSize: "15px" }}
            >
              {ctaText}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href={DEFAULTS.cta2Href}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 text-white font-normal tracking-wide backdrop-blur-sm transition-all duration-300 hover:border-[rgb(var(--accent-gold-rgb)/60%)] hover:bg-[rgb(var(--accent-gold-rgb)/10%)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ padding: "14px 32px", fontSize: "15px" }}
            >
              {DEFAULTS.cta2Text}
            </Link>
          </div>

          {proofItems.length > 0 && (
            <dl className="hero-fade-up mt-9 grid max-w-[270px] grid-cols-2 gap-3 sm:max-w-3xl sm:grid-cols-4" style={{ animationDelay: "0.3s" }}>
              {proofItems.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/[0.1] bg-black/[0.2] px-4 py-3 backdrop-blur-md">
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-white/42">{item.label}</dt>
                  <dd className="mt-1 font-serif text-2xl leading-none text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </motion.div>
    </section>
  );
}
