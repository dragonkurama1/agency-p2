import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { DevisForm } from "@/components/forms/devis-form";
import { getServices } from "@/data/services";
import { getPageMeta } from "@/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("devis", {
    title: "Demander un devis",
    description: "Demandez un devis gratuit à Prestigia Agency pour votre projet de marketing digital, site web, SEO ou publicité à Casablanca.",
  });
}

export default async function DevisPage() {
  const services = await getServices();
  return (
    <section className="container-px mx-auto max-w-3xl py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Devis gratuit"
        title="Parlons de votre projet digital"
        subtitle="Quatre étapes, deux minutes. Nous vous répondons sous 24h ouvrées avec une première direction claire."
      />
      <div className="mt-12">
        <DevisForm services={services} />
      </div>
    </section>
  );
}
