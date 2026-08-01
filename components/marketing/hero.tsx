"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SectionContent } from "@/data/sections";

const DEFAULTS = {
  eyebrow: "Agence marketing digital — Casablanca",
  title: "Nous construisons une présence digitale qui attire, engage et convertit.",
  subtitle:
    "Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats, pensée pour les marques qui veulent grandir.",
  ctaText: "Demander un devis",
  ctaHref: "/devis",
  cta2Text: "Voir nos réalisations",
  cta2Href: "/realisations",
};

export function Hero({ section }: { section?: SectionContent | null }) {
  const title = section?.title || DEFAULTS.title;
  const subtitle = section?.subtitle || DEFAULTS.subtitle;
  const ctaText = section?.button_text || DEFAULTS.ctaText;
  const ctaHref = section?.button_link || DEFAULTS.ctaHref;

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(201,162,39,0.12),transparent_55%)]" />
      <div className="container-px mx-auto max-w-7xl py-24 sm:py-32">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-gold)] mb-6"
        >
          {DEFAULTS.eyebrow}
        </motion.p>
        <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
          {title}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-muted-foreground text-lg max-w-xl"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button asChild size="lg">
            <Link href={ctaHref}>
              {ctaText} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={DEFAULTS.cta2Href}>{DEFAULTS.cta2Text}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
