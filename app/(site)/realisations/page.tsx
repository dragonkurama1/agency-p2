import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getProjects, getProjectCategories } from "@/data/projects";
import { getSectionByKey } from "@/data/sections";
import { getPageMeta } from "@/data/pages";
import { WebPageJsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("realisations", {
    title: "Réalisations",
    description:
      "Découvrez les projets réalisés par Prestigia Agency pour ses clients à Casablanca : sites web, SEO, branding, social media et publicité.",
    ogTitle: "Réalisations — Prestigia Agency",
  });
}

export default async function RealisationsPage() {
  const [projects, categories, hero] = await Promise.all([getProjects(), getProjectCategories(), getSectionByKey("realisations", "hero")]);
  return (
    <>
      <WebPageJsonLd
        title="Réalisations — Prestigia Agency"
        description="Projets digitaux réalisés pour nos clients à Casablanca : SEO, publicité, branding, web."
        path="/realisations"
        breadcrumbs={[{ name: "Réalisations", href: "/realisations" }]}
      />
      <section className="container-px mx-auto max-w-7xl py-20" aria-label="Nos réalisations">
        <SectionHeading
          eyebrow="Réalisations"
          title={hero?.title || "Des résultats concrets, pour des clients réels"}
          subtitle={hero?.subtitle || "Un aperçu de nos projets récents à Casablanca et au Maroc."}
        />
        <div className="mt-12">
          <PortfolioGrid projects={projects} categories={categories} />
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
