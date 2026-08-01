"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

/**
 * Technique bordure lumineuse animée :
 * 1. Div externe  → overflow:hidden + border-radius  (clippe tout)
 * 2. Div rotative → conic-gradient en dégradé violet, tourne en continu
 *    → seul le bord (1.5 px) est visible grâce à la div interne
 * 3. Div interne  → fond sombre, inset: 1.5px → crée l'illusion d'une bordure
 * 4. Image        → mix-blend-mode:screen pour neutraliser les fonds noirs
 */
function PartnerCard({ partner }: { partner: Partner }) {
  const card = (
    /* ── Conteneur externe : clippe + hover ─────────────────────── */
    <div
      className="
        relative flex-shrink-0 rounded-2xl overflow-hidden
        transition-all duration-400 ease-out
        hover:scale-[1.07] hover:-translate-y-[3px]
        cursor-pointer group
      "
      style={{ width: 172, height: 88 }}
    >
      {/* ── Arc lumineux tournant ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          /* 250% × 250% centré → couvre tous les angles en rotation */
          width: "250%",
          height: "250%",
          top: "-75%",
          left: "-75%",
          /* Arc violet étroit (~100°) sur fond transparent */
          background: `conic-gradient(
            from 0deg,
            transparent       0deg,
            transparent       55deg,
            #4c1d95           75deg,
            #6d28d9           90deg,
            #7c3aed          100deg,
            #8b5cf6          108deg,
            #c4b5fd          115deg,
            #8b5cf6          122deg,
            #7c3aed          130deg,
            #6d28d9          145deg,
            #4c1d95          160deg,
            transparent      175deg,
            transparent      360deg
          )`,
          animation: "border-spin 4s linear infinite",
        }}
      />

      {/* ── Fond sombre intérieur : laisse 1.5 px de bordure visible ─ */}
      <div
        style={{
          position: "absolute",
          inset: 1.5,
          borderRadius: 14, /* légèrement moins que rounded-2xl (16px) */
          background: "linear-gradient(145deg, #252529 0%, #1b1b1e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Reflet haut */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            top: 0,
            height: "40%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)",
            pointerEvents: "none",
          }}
        />

        {partner.logo_url ? (
          <Image
            src={normalizeImageUrl(partner.logo_url)}
            alt={partner.name}
            width={144}
            height={58}
            sizes="144px"
            quality={85}
            className="
              relative z-10
              w-auto max-w-[136px] h-[52px] object-contain
              transition-all duration-400
              group-hover:scale-110
            "
            style={{ mixBlendMode: "screen" }}
            draggable={false}
          />
        ) : (
          <span className="relative z-10 font-serif text-sm font-medium tracking-wider text-white/75 text-center leading-tight px-4 transition-colors duration-300 group-hover:text-white">
            {partner.name}
          </span>
        )}
      </div>
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
    <div role="img" aria-label={partner.name}>{card}</div>
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

  /* ── Track seamless ─────────────────────────────────────────── */
  const cardWidth = 204; // 172px carte + 32px gap
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
