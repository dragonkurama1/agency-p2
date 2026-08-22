"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

function PartnerCard({ partner }: { partner: Partner }) {
  const hasLink = Boolean(partner.website);
  const [open, setOpen] = useState(false);

  return (
    <div
      className="group relative h-44 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_48px_rgb(var(--accent-gold-rgb)/28%)]"
      style={{
        background: "rgba(8,6,20,0.45)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(140,82,255,0.18)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}
      onClick={() => setOpen((v) => !v)}
      role="button"
      aria-expanded={open}
      aria-label={`${partner.name}${hasLink ? " — cliquer pour voir les infos" : ""}`}
    >
      {/* ── État par défaut : logo centré ───────────────────────────── */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-90${
          open ? " opacity-0 scale-90" : ""
        }`}
      >
        {partner.logo_url ? (
          <Image
            src={normalizeImageUrl(partner.logo_url)}
            alt={`Logo ${partner.name}`}
            width={160}
            height={64}
            sizes="160px"
            quality={90}
            className="max-w-[70%] max-h-16 w-auto object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        ) : (
          <span className="font-serif text-xl uppercase text-white/50 text-center px-4">
            {partner.name}
          </span>
        )}
      </div>

      {/* ── État hover/tap : panneau d'info ─────────────────────────── */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-5 transition-all duration-400 ease-out group-hover:opacity-100 group-hover:translate-y-0${
          open ? " opacity-100 translate-y-0" : " opacity-0 translate-y-3"
        }`}
        style={{
          background:
            "linear-gradient(145deg, rgba(12,5,30,0.88) 0%, rgba(20,10,42,0.92) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Logo petit en haut */}
        {partner.logo_url && (
          <div className="flex items-start">
            <Image
              src={normalizeImageUrl(partner.logo_url)}
              alt={`Logo ${partner.name}`}
              width={80}
              height={28}
              sizes="80px"
              quality={90}
              className="max-w-[48%] max-h-7 w-auto object-contain"
              style={{ mixBlendMode: "screen" }}
            />
          </div>
        )}

        {/* Infos bas */}
        <div>
          <p className="font-serif text-lg uppercase text-white leading-tight mb-1">
            {partner.name}
          </p>
          {partner.description && (
            <p className="font-sans text-[11px] text-white/50 leading-relaxed mb-3 line-clamp-2">
              {partner.description}
            </p>
          )}
          {hasLink ? (
            /* Lien explicite — stopPropagation pour ne pas toggler la carte */
            <Link
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              title={`Voir ${partner.name}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-normal text-[var(--accent-gold)] hover:text-[var(--accent-gold-text)] transition-colors"
            >
              Voir le projet <ExternalLink className="size-3" />
            </Link>
          ) : (
            <span className="font-sans text-[11px] text-[rgb(var(--accent-gold-rgb)/40%)] font-medium tracking-wide">
              Client Prestigia
            </span>
          )}
        </div>
      </div>

      {/* ── Bordure glow au hover/tap ───────────────────────────────── */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-1 transition-all duration-500 group-hover:ring-[rgb(var(--accent-gold-rgb)/45%)]${
          open ? " ring-[rgb(var(--accent-gold-rgb)/45%)]" : " ring-transparent"
        }`}
      />
    </div>
  );
}

export function PartnersGrid({ partners }: { partners: Partner[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {partners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  );
}
