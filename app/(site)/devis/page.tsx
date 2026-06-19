import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { DevisForm } from "@/components/forms/devis-form";
import { getServices } from "@/data/services";

export const metadata: Metadata = {
  title: "Demander un devis",
  description: "Demandez un devis gratuit à Prestigia Agency pour votre projet de marketing digital, site web, SEO ou publicité à Casablanca.",
  alternates: { canonical: "/devis" },
};

export default async function DevisPage() {
  const services = await getServices();
  return (
    <section className="container-px mx-auto max-w-3xl py-20">
      <SectionHeading
        eyebrow="Devis gratuit"
        title="Parlons de votre projet"
        subtitle="Quatre étapes, deux minutes. Nous vous répondons sous 24h ouvrées."
      />
      <div className="mt-12">
        <DevisForm services={services} />
      </div>
    </section>
  );
}
