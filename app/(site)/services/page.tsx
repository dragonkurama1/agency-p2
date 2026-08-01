import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getServices } from "@/data/services";
import { getSectionByKey } from "@/data/sections";
import { getPageMeta } from "@/data/pages";
import { WebPageJsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("services", {
    title: "Nos Services",
    description:
      "Découvrez les services de Prestigia Agency à Casablanca : création de site web, SEO, GEO, Google Ads, Meta Ads, branding, community management et automatisation marketing.",
    ogTitle: "Services Marketing Digital — Prestigia Agency Casablanca",
  });
}

export default async function ServicesPage() {
  const [services, hero] = await Promise.all([
    getServices(),
    getSectionByKey("services", "hero"),
  ]);
  return (
    <>
      <WebPageJsonLd
        title="Nos Services — Prestigia Agency"
        description="Services marketing digital à Casablanca : SEO, GEO, création de site web, Google Ads, Meta Ads, branding."
        path="/services"
        breadcrumbs={[{ name: "Services", href: "/services" }]}
      />
      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading
          eyebrow="Nos services"
          title={hero?.title || "Tout ce qu'il faut pour développer votre présence digitale"}
          subtitle={hero?.subtitle || "Dix expertises complémentaires, mobilisables séparément ou dans une stratégie globale."}
        />
        <div className="mt-12">
          <ServicesGrid services={services} />
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
