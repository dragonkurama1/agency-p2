"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
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
          Agence marketing digital — Casablanca
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-serif text-4xl sm:text-6xl leading-[1.05] max-w-3xl"
        >
          Nous ne créons pas seulement du contenu.
          <br />
          Nous construisons une présence digitale qui attire, engage et convertit.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-muted-foreground text-lg max-w-xl"
        >
          Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats,
          pensée pour les marques qui veulent grandir.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button asChild size="lg">
            <Link href="/devis">
              Demander un devis <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/realisations">Voir nos réalisations</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
