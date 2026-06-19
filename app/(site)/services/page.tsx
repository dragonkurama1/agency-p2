import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getServices } from "@/data/services";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Découvrez les services de Prestigia Agency : création de site web, SEO, Google Ads & Meta Ads, community management, branding, automatisation et stratégie digitale à Casablanca.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading
          eyebrow="Nos services"
          title="Tout ce qu'il faut pour développer votre présence digitale"
          subtitle="Dix expertises complémentaires, mobilisables séparément ou dans une stratégie globale."
        />
        <div className="mt-12">
          <ServicesGrid services={services} />
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
