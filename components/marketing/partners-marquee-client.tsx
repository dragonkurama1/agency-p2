"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

function Separator() {
  return (
    <span
      aria-hidden="true"
      className="mx-2 flex-shrink-0 text-[var(--accent-gold)] opacity-30 select-none"
    >
      ✦
    </span>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const img = partner.logo_url ? (
    <Image
      src={normalizeImageUrl(partner.logo_url)}
      alt={partner.name}
      width={160}
      height={56}
      className="h-12 w-auto max-w-[160px] object-contain transition-transform duration-300 hover:scale-105"
    />
  ) : (
    <span className="font-serif text-base tracking-widest uppercase text-[var(--muted-foreground)]">
      {partner.name}
    </span>
  );

  const cls =
    "flex items-center justify-center px-10 flex-shrink-0";

  return partner.website ? (
    <Link
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visiter le site de ${partner.name}`}
      className={cls + " cursor-pointer"}
    >
      {img}
    </Link>
  ) : (
    <div className={cls + " cursor-default"}>{img}</div>
  );
}

export function PartnersMarqueeInner({
  partners,
  duration,
}: {
  partners: Partner[];
  duration: number;
}) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function pause() {
    clearTimeout(timerRef.current);
    setPaused(true);
  }
  function resume() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPaused(false), 600);
  }

  /* ── Calcul du track (seamless loop) ─────────────────────────── */
  const avgItemWidth = 200;
  const targetWidth = 5000;
  const copiesNeeded = Math.max(4, Math.ceil(targetWidth / (partners.length * avgItemWidth)));
  const totalCopies = copiesNeeded % 2 === 0 ? copiesNeeded : copiesNeeded + 1;
  const half = Array.from({ length: totalCopies / 2 }, () => partners).flat();
  const track = [...half, ...half];

  return (
    <div
      /* isolation: isolate isole le blend-mode de l'overlay */
      className="relative"
      style={{
        isolation: "isolate",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* ── Track animé ──────────────────────────────────────────── */}
      <div
        className="flex items-center w-max"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
          WebkitBackfaceVisibility: "hidden",
        } as React.CSSProperties}
        aria-hidden="true"
      >
        {track.map((partner, i) => (
          <span key={`${partner.id}-${i}`} className="flex items-center flex-shrink-0">
            <PartnerLogo partner={partner} />
            <Separator />
          </span>
        ))}
      </div>

      {/* ── Spotlight overlay ─────────────────────────────────────
          mix-blend-mode: saturation applique la saturation de l'overlay
          (gris = 0%) sur les logos en dessous → les logos sous la zone
          grise deviennent désaturés. Là où l'overlay est transparent,
          les logos gardent leurs vraies couleurs.
      ─────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          /* gris aux bords → désaturé ; transparent au centre → couleur */
          background:
            "linear-gradient(to right, hsl(0,0%,50%) 0%, transparent 32%, transparent 68%, hsl(0,0%,50%) 100%)",
          mixBlendMode: "saturation",
        }}
      />
    </div>
  );
}
