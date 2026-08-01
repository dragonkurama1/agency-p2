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
      className="mx-6 flex-shrink-0 select-none text-[var(--accent-gold)]/25 text-xs"
    >
      ◆
    </span>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const img = partner.logo_url ? (
    <Image
      src={normalizeImageUrl(partner.logo_url)}
      alt={partner.name}
      width={200}
      height={72}
      className="h-14 w-auto max-w-[200px] object-contain
                 transition-all duration-500
                 group-hover:scale-110 group-hover:brightness-110"
      draggable={false}
    />
  ) : (
    <span
      className="font-serif text-sm tracking-widest uppercase
                 text-[var(--muted-foreground)]
                 transition-colors duration-300
                 group-hover:text-[var(--foreground)]"
    >
      {partner.name}
    </span>
  );

  const base =
    "group flex items-center justify-center px-10 flex-shrink-0 py-2";

  return partner.website ? (
    <Link
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visiter le site de ${partner.name}`}
      className={base + " cursor-pointer"}
    >
      {img}
    </Link>
  ) : (
    <div className={base + " cursor-default"}>{img}</div>
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
  const avgItemWidth = 240;
  const targetWidth = 5000;
  const copiesNeeded = Math.max(
    4,
    Math.ceil(targetWidth / (partners.length * avgItemWidth))
  );
  const totalCopies = copiesNeeded % 2 === 0 ? copiesNeeded : copiesNeeded + 1;
  const half = Array.from(
    { length: totalCopies / 2 },
    () => partners
  ).flat();
  const track = [...half, ...half];

  return (
    <div
      className="relative overflow-hidden"
      style={{
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
          <span
            key={`${partner.id}-${i}`}
            className="flex items-center flex-shrink-0"
          >
            <PartnerLogo partner={partner} />
            <Separator />
          </span>
        ))}
      </div>
    </div>
  );
}
