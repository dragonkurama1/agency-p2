import { getPartners } from "@/data/partners";
import { PartnersGrid } from "./partners-marquee-client";

export async function PartnersMarquee() {
  const partners = await getPartners();
  if (!partners.length) return null;

  return (
    <section
      className="py-24"
      aria-label="Nos clients et partenaires"
    >
      <div className="container-px mx-auto max-w-7xl">

        {/* ── En-tête de section ──────────────────────────────────── */}
        <div className="mb-14 flex items-center gap-6">
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(to right, transparent, rgb(var(--accent-gold-rgb) / 0.35))",
            }}
          />
          <p className="whitespace-nowrap text-[10px] font-normal uppercase tracking-[0.5em] text-white/35">
            Ils nous font confiance
          </p>
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(to left, transparent, rgb(var(--accent-gold-rgb) / 0.35))",
            }}
          />
        </div>

        {/* ── Grille premium ──────────────────────────────────────── */}
        <PartnersGrid partners={partners} />
      </div>
    </section>
  );
}
