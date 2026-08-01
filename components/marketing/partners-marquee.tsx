import Image from "next/image";
import Link from "next/link";
import { getPartners } from "@/data/partners";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

function PartnerLogo({ partner }: { partner: Partner }) {
  const inner = partner.logo_url ? (
    <Image
      src={normalizeImageUrl(partner.logo_url)}
      alt={partner.name}
      width={140}
      height={48}
      className="h-10 w-auto max-w-[140px] object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  ) : (
    <span className="text-sm font-medium tracking-wide text-[var(--muted-foreground)] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
      {partner.name}
    </span>
  );

  return partner.website ? (
    <Link
      href={partner.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={partner.name}
      className="group flex items-center justify-center px-8"
    >
      {inner}
    </Link>
  ) : (
    <div className="group flex items-center justify-center px-8">
      {inner}
    </div>
  );
}

export async function PartnersMarquee() {
  const partners = await getPartners();

  // Besoin d'au moins 1 partenaire pour afficher le ruban
  if (!partners.length) return null;

  // Dupliquer pour boucle infinie seamless
  const doubled = [...partners, ...partners];

  // Vitesse adaptée au nombre : plus il y en a, plus c'est rapide
  const duration = Math.max(20, partners.length * 6);

  return (
    <section
      className="border-b border-[var(--border)] bg-[var(--muted)] py-8 overflow-hidden"
      aria-label="Nos clients et partenaires"
    >
      {/* Dégradé fade sur les bords */}
      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div
          className="flex w-max"
          style={{ animation: `marquee ${duration}s linear infinite` }}
          aria-hidden="true"
        >
          {doubled.map((partner, i) => (
            <PartnerLogo key={`${partner.id}-${i}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
