"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

function PartnerCard({ partner }: { partner: Partner }) {
  const hasLink = Boolean(partner.website);

  const card = (
    <div
      className="group relative h-44 rounded-2xl overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_48px_rgba(124,58,237,0.22)]"
      style={{
        background: "#200E3B",
        border: "1px solid rgba(124,58,237,0.18)",
      }}
    >
      {/* ── État par défaut : logo centré ───────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-90">
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

      {/* ── État hover : panneau d'info ─────────────────────────────── */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-5 opacity-0 translate-y-3 transition-all duration-400 ease-out group-hover:opacity-100 group-hover:translate-y-0"
        style={{
          background: "linear-gradient(145deg, #160830 0%, #200E3B 100%)",
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
            <p className="text-[11px] text-white/50 leading-relaxed mb-3 line-clamp-2">
              {partner.description}
            </p>
          )}
          {hasLink ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C3AED] hover:text-[#a78bfa] transition-colors">
              Voir le projet <ExternalLink className="size-3" />
            </span>
          ) : (
            <span className="text-[11px] text-[#7C3AED]/40 font-medium tracking-wide">
              Client Prestigia
            </span>
          )}
        </div>
      </div>

      {/* ── Bordure glow au hover ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-500 group-hover:ring-[#7C3AED]/45"
      />
    </div>
  );

  return hasLink ? (
    <Link
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Voir le projet ${partner.name}`}
    >
      {card}
    </Link>
  ) : (
    <div role="img" aria-label={partner.name}>
      {card}
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

/* ── Ancien marquee conservé pour compatibilité (non utilisé) ─────────────── */
export function PartnersMarqueeInner({
  partners,
  duration,
}: {
  partners: Partner[];
  duration: number;
}) {
  return <PartnersGrid partners={partners} />;
}
