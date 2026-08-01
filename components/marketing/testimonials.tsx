"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useRef, useState } from "react";
import type { Testimonial } from "@/data/testimonials";
import { normalizeImageUrl } from "@/lib/parse";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex-shrink-0 w-[320px] sm:w-[360px] rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 flex flex-col mx-3">
      <div className="flex gap-1">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-[var(--accent-gold)] text-[var(--accent-gold)]" />
        ))}
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed flex-1">
        &laquo; {t.message} &raquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {t.photo_url ? (
          <Image
            src={normalizeImageUrl(t.photo_url)}
            alt={`Photo de ${t.client_name}`}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover flex-shrink-0 ring-2 ring-[var(--accent-gold)]/30"
          />
        ) : (
          <div className="size-10 rounded-full bg-[var(--accent-gold)]/20 flex-shrink-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-[var(--accent-gold)]">
              {t.client_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{t.client_name}</p>
          {t.company && (
            <p className="text-xs text-muted-foreground">{t.company}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  function pause() {
    clearTimeout(timerRef.current);
    setPaused(true);
  }
  function resume() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPaused(false), 1500);
  }

  if (!testimonials.length) return null;

  /* ── Construire un track seamless ─────────────────────────────── */
  // On duplique les cartes jusqu'à avoir au moins 6 copies pour assurer
  // un loop parfait même avec très peu de témoignages
  const minCopies = 6;
  const copies = Math.max(minCopies, Math.ceil(minCopies / testimonials.length));
  // total doit être pair
  const totalCopies = copies % 2 === 0 ? copies : copies + 1;
  const half = Array.from({ length: totalCopies / 2 }, () => testimonials).flat();
  const track = [...half, ...half];

  // Vitesse : ~35px/s, durée proportionnelle au nombre de cartes
  const cardWidth = 384; // 360px + 2*12px margin
  const totalItems = half.length;
  const duration = Math.max(20, Math.round((totalItems * cardWidth) / 35));

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
      {/* Track animé */}
      <div
        className="flex items-stretch w-max py-2"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
          WebkitBackfaceVisibility: "hidden",
        } as React.CSSProperties}
        aria-label="Témoignages clients"
      >
        {track.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}
