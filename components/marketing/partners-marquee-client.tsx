"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

/** Carte logo — fond blanc, dimensions fixes, hover élégant */
function PartnerCard({ partner }: { partner: Partner }) {
  const card = (
    <div
      className="
        relative flex items-center justify-center flex-shrink-0
        w-[168px] h-[84px]
        bg-white rounded-2xl px-5 py-3
        shadow-[0_2px_12px_rgba(0,0,0,0.18)]
        border border-white/20
        transition-all duration-400 ease-out
        hover:shadow-[0_6px_24px_rgba(0,0,0,0.28)]
        hover:scale-105 hover:-translate-y-1
        cursor-pointer
      "
    >
      {partner.logo_url ? (
        <Image
          src={normalizeImageUrl(partner.logo_url)}
          alt={partner.name}
          width={140}
          height={56}
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <span className="font-serif text-sm font-medium tracking-wide text-gray-800 text-center leading-tight">
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

  /* ── Track seamless (2x half) ────────────────────────────────── */
  // Chaque carte ≈ 168px + 32px de marge = 200px
  const cardWidth = 200;
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
