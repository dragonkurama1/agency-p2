"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import type { Testimonial } from "@/data/testimonials";
import { normalizeImageUrl } from "@/lib/parse";

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure
      className="flex-shrink-0 w-[300px] sm:w-[340px] rounded-2xl flex flex-col mx-3 select-none glass-card p-6 relative overflow-hidden"
    >
      {/* Glow coin haut-gauche */}
      <div
        aria-hidden="true"
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      {/* Étoiles */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star
            key={i}
            className="size-4"
            style={{
              fill: "#b39dfa",
              color: "#b39dfa",
              filter: "drop-shadow(0 0 4px rgba(124,58,237,0.6))",
            }}
          />
        ))}
      </div>

      <blockquote className="text-sm leading-relaxed flex-1 text-[var(--foreground)] opacity-85">
        &laquo; {t.message} &raquo;
      </blockquote>

      {/* Séparateur */}
      <div
        className="my-4 h-px"
        style={{
          background: "linear-gradient(to right, rgba(124,58,237,0.3), transparent)",
        }}
      />

      <figcaption className="flex items-center gap-3">
        {t.photo_url ? (
          <Image
            src={normalizeImageUrl(t.photo_url)}
            alt={`Photo de ${t.client_name}`}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover flex-shrink-0"
            style={{
              boxShadow: "0 0 0 2px rgba(124,58,237,0.35), 0 0 12px rgba(124,58,237,0.2)",
            }}
            draggable={false}
          />
        ) : (
          <div
            className="size-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.35)",
            }}
          >
            <span className="text-sm font-normal text-[var(--accent-gold-text)]">
              {t.client_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white">{t.client_name}</p>
          {t.company && (
            <p className="text-xs text-[var(--muted-foreground)]">{t.company}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft0 = useRef(0);
  const halfRef = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rafMeasure = requestAnimationFrame(() => {
      halfRef.current = el.scrollWidth / 2;
    });

    let animId: number;
    function step() {
      if (!isDragging.current && el) {
        el.scrollLeft += 0.8;
        if (halfRef.current > 0 && el.scrollLeft >= halfRef.current) {
          el.scrollLeft -= halfRef.current;
        }
      }
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafMeasure);
      cancelAnimationFrame(animId);
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    setGrabbing(true);
    startX.current = e.clientX;
    scrollLeft0.current = containerRef.current?.scrollLeft ?? 0;
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !containerRef.current) return;
    containerRef.current.scrollLeft = scrollLeft0.current + (startX.current - e.clientX);
  }
  function onMouseUp() { isDragging.current = false; setGrabbing(false); }
  function onTouchStart() { isDragging.current = true; }
  function onTouchEnd() { setTimeout(() => { isDragging.current = false; }, 800); }

  const track = [...testimonials, ...testimonials];

  return (
    <div
      ref={containerRef}
      className="overflow-x-scroll [&::-webkit-scrollbar]:hidden"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        cursor: grabbing ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
      } as React.CSSProperties}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-stretch w-max py-3">
        {track.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}
