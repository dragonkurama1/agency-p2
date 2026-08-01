import { getPartners } from "@/data/partners";
import { PartnersMarqueeInner } from "./partners-marquee-client";

export async function PartnersMarquee() {
  const partners = await getPartners();
  if (!partners.length) return null;

  /* Vitesse : ~55px/s. Chaque carte ≈ 200px, donc duration ≈ 200/55 ≈ 3.6s/carte */
  const duration = Math.max(60, Math.round((partners.length * 200 * 4) / 55));

  return (
    <section
      className="relative overflow-hidden bg-[var(--muted)] py-14"
      aria-label="Nos clients et partenaires"
    >
      {/* ── Ligne d'accent dorée — haut ──────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, var(--accent-gold) 40%, var(--accent-gold) 60%, transparent 100%)",
          opacity: 0.35,
        }}
      />

      {/* ── Titre luxueux ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-5 mb-12 px-6">
        {/* Ligne gauche */}
        <div
          className="h-px flex-1 max-w-[100px]"
          style={{
            background:
              "linear-gradient(to right, transparent, color-mix(in srgb, var(--accent-gold) 35%, transparent))",
          }}
        />

        <div className="flex flex-col items-center gap-2">
          {/* Ornement */}
          <span
            className="text-[var(--accent-gold)] leading-none select-none"
            style={{ fontSize: "8px", letterSpacing: "0.4em" }}
            aria-hidden="true"
          >
            ✦ ✦ ✦
          </span>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.45em]
                       text-[var(--muted-foreground)] whitespace-nowrap"
          >
            Ils nous font confiance
          </p>
        </div>

        {/* Ligne droite */}
        <div
          className="h-px flex-1 max-w-[100px]"
          style={{
            background:
              "linear-gradient(to left, transparent, color-mix(in srgb, var(--accent-gold) 35%, transparent))",
          }}
        />
      </div>

      {/* ── Ruban de logos ────────────────────────────────────────── */}
      <PartnersMarqueeInner partners={partners} duration={duration} />

      {/* ── Ligne d'accent dorée — bas ───────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, var(--accent-gold) 40%, var(--accent-gold) 60%, transparent 100%)",
          opacity: 0.35,
        }}
      />
    </section>
  );
}
