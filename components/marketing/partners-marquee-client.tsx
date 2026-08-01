"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

/**
 * Carte logo universelle — fonctionne avec TOUT type de logo :
 *   • Logo transparent     → rendu parfait
 *   • Logo fond blanc      → fond blanc visible sur carte sombre (look "étiquette" premium)
 *   • Logo fond NOIR/SOMBRE → mix-blend-mode: screen fait disparaître le fond noir
 *                             contre la carte sombre → seul le logotype reste visible
 */
function PartnerCard({ partner }: { partner: Partner }) {
  const card = (
    <div
      className="
        relative flex items-center justify-center flex-shrink-0
        w-[172px] h-[88px]
        rounded-2xl overflow-hidden
        border border-white/[0.08]
        transition-all duration-400 ease-out
        hover:border-white/20
        hover:scale-[1.06] hover:-translate-y-1
        cursor-pointer
        group
      "
      style={{
        background: "linear-gradient(145deg, #242428 0%, #1a1a1d 100%)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Reflet subtil en haut */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {partner.logo_url ? (
        <Image
          src={normalizeImageUrl(partner.logo_url)}
          alt={partner.name}
          width={144}
          height={60}
          className="
            w-auto max-w-[140px] h-[60px] object-contain
            transition-all duration-400
            group-hover:scale-110
          "
          style={{
            /*
             * mix-blend-mode: screen sur fond sombre :
             * → pixel noir (0,0,0) screen avec fond → fond s'affiche (invisible) ✓
             * → pixel coloré → légèrement illuminé, couleurs bien lisibles ✓
             * → fond transparent → rendu normal ✓
             */
            mixBlendMode: "screen",
          }}
          draggable={false}
        />
      ) : (
        <span className="font-serif text-sm font-medium tracking-wider text-white/80 text-center leading-tight px-4 group-hover:text-white transition-colors">
          {partner.name}
        </span>
      )}
    </div>
  );

  return partner.website ? (
    <Link
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visiter le site de ${partner.name}`}
    >
      {card}
    </Link>
  ) : (
    <div aria-label={partner.name}>{card}</div>
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
    timerRef.current = setTimeout(() => setPaused(false), 500);
  }

  /* ── Track seamless : cartes 172px + gap 32px = ~204px ─────── */
  const cardWidth = 204;
  const targetWidth = 5000;
  const copiesNeeded = Math.max(
    4,
    Math.ceil(targetWidth / (partners.length * cardWidth))
  );
  const totalCopies = copiesNeeded % 2 === 0 ? copiesNeeded : copiesNeeded + 1;
  const half = Array.from({ length: totalCopies / 2 }, () => partners).flat();
  const track = [...half, ...half];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div
        className="flex items-center gap-8 w-max px-4"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
          WebkitBackfaceVisibility: "hidden",
        } as React.CSSProperties}
        aria-hidden="true"
      >
        {track.map((partner, i) => (
          <PartnerCard key={`${partner.id}-${i}`} partner={partner} />
        ))}
      </div>
    </div>
  );
}
