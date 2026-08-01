import { getPartners } from "@/data/partners";
import { PartnersMarqueeInner } from "./partners-marquee-client";

export async function PartnersMarquee() {
  const partners = await getPartners();
  if (!partners.length) return null;

  const duration = Math.max(80, partners.length * 20);

  return (
    <section
      className="relative border-b border-[var(--border)] bg-[var(--muted)] py-10 overflow-hidden"
      aria-label="Nos clients et partenaires"
    >
      {/* Titre discret */}
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-8 opacity-50">
        Ils nous font confiance
      </p>

      <PartnersMarqueeInner partners={partners} duration={duration} />
    </section>
  );
}
