import Image from "next/image";
import Link from "next/link";
import { getPartners } from "@/data/partners";
import { normalizeImageUrl } from "@/lib/parse";
import type { Partner } from "@/data/partners";

/** Séparateur décoratif entre logos */
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

/** Un logo cliquable (ou non) */
function PartnerLogo({ partner }: { partner: Partner }) {
  const img = partner.logo_url ? (
    <Image
      src={normalizeImageUrl(partner.logo_url)}
      alt={partner.name}
      width={160}
      height={56}
      className="h-12 w-auto max-w-[160px] object-contain grayscale opacity-50 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
    />
  ) : (
    <span className="font-serif text-base tracking-widest uppercase text-[var(--muted-foreground)] opacity-50 transition-opacity duration-500 group-hover:opacity-100 group-hover:text-[var(--foreground)]">
      {partner.name}
    </span>
  );

  const cls =
    "group flex items-center justify-center px-10 flex-shrink-0 cursor-default transition-transform duration-300 hover:scale-105";

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
    <div className={cls}>{img}</div>
  );
}

export async function PartnersMarquee() {
  const partners = await getPartners();
  if (!partners.length) return null;

  // Multiplier pour remplir au moins 5000px même avec peu de partenaires
  // avgItemWidth ≈ 200px (logo 160px + padding 40px)
  const avgItemWidth = 200;
  const targetWidth = 5000; // px — assure qu'il n'y a aucun vide sur grands écrans
  const copiesNeeded = Math.max(4, Math.ceil(targetWidth / (partners.length * avgItemWidth)));
  // Doit être pair pour que les 2 moitiés soient identiques (boucle seamless)
  const totalCopies = copiesNeeded % 2 === 0 ? copiesNeeded : copiesNeeded + 1;

  // Construction du track : 1ère moitié = 2ème moitié pour boucle parfaite
  const half = Array.from({ length: totalCopies / 2 }, () => partners).flat();
  const track = [...half, ...half];

  const duration = Math.max(25, partners.length * 8);

  return (
    <section
      className="relative border-b border-[var(--border)] bg-[var(--muted)] py-10 overflow-hidden"
      aria-label="Nos clients et partenaires"
    >
      {/* Titre discret */}
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-8 opacity-50">
        Ils nous font confiance
      </p>

      {/* Dégradé fade bords */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="flex items-center w-max"
          style={{ animation: `marquee ${duration}s linear infinite` }}
          aria-hidden="true"
        >
          {track.map((partner, i) => (
            <span key={`${partner.id}-${i}`} className="flex items-center flex-shrink-0">
              <PartnerLogo partner={partner} />
              <Separator />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
