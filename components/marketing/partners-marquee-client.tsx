"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
      className="h-12 w-auto max-w-[160px] object-contain"
    />
  ) : (
    <span className="font-serif text-base tracking-widest uppercase text-[var(--muted-foreground)]">
      {partner.name}
    </span>
  );

  const cls = "flex items-center justify-center px-10 flex-shrink-0";

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

  /* ── Track seamless ────────────────────────────────────────── */
  const avgItemWidth = 200;
  const targetWidth = 5000;
  const copiesNeeded = Math.max(4, Math.ceil(targetWidth / (partners.length * avgItemWidth)));
  const totalCopies = copiesNeeded % 2 === 0 ? copiesNeeded : copiesNeeded + 1;
  const half = Array.from({ length: totalCopies / 2 }, () => partners).flat();
  const track = [...half, ...half];

  const trackStyle = {
    animation: `marquee ${duration}s linear infinite`,
    animationPlayState: paused ? "paused" : "running",
    willChange: "transform",
    WebkitBackfaceVisibility: "hidden",
  } as React.CSSProperties;

  const items = track.map((partner, i) => (
    <span key={`${partner.id}-${i}`} className="flex items-center flex-shrink-0">
      <PartnerLogo partner={partner} />
      <Separator />
    </span>
  ));

  /* ── Couleur spotlight : double-track
       - Track du bas : grayscale (toujours visible)
       - Track du haut : couleur, masqué pour ne montrer que le centre
  ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="relative"
      style={{
        /* Fade bords */
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 600)}
    >
      {/* Track grayscale — base, toujours visible */}
      <div
        className="flex items-center w-max"
        style={{ ...trackStyle, filter: "grayscale(1) opacity(0.35)" }}
        aria-hidden="true"
      >
        {items}
      </div>

      {/* Track couleur — superposé, visible uniquement au centre */}
      <div
        className="absolute inset-0 flex items-center w-max"
        style={{
          ...trackStyle,
          /* Révèle les couleurs uniquement au centre (28%-72%) */
          maskImage:
            "linear-gradient(to right, transparent 0%, black 28%, black 72%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 28%, black 72%, transparent 100%)",
        }}
        aria-hidden="true"
      >
        {/* Re-créer les items pour éviter les conflits de clés React */}
        {track.map((partner, i) => (
          <span key={`color-${partner.id}-${i}`} className="flex items-center flex-shrink-0">
            <PartnerLogo partner={partner} />
            <Separator />
          </span>
        ))}
      </div>
    </div>
  );
}
