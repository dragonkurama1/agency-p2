import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getProjects, getProjectCategories } from "@/data/projects";

export const metadata: Metadata = {
  title: "Réalisations",
  description: "Découvrez les projets réalisés par Prestigia Agency pour ses clients à Casablanca : sites web, SEO, branding, social media et publicité.",
  alternates: { canonical: "/realisations" },
};

export default async function RealisationsPage() {
  const [projects, categories] = await Promise.all([getProjects(), getProjectCategories()]);
  return (
    <>
      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading
          eyebrow="Réalisations"
          title="Des résultats concrets, pour des clients réels"
          subtitle="Un aperçu de nos projets récents à Casablanca et au Maroc."
        />
        <div className="mt-12">
          <PortfolioGrid projects={projects} categories={categories} />
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
