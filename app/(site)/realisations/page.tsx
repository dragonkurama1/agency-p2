import type { Metadata } from "next";
import { RealisationsDnaExperience } from "@/components/marketing/realisations-dna-experience";
import { getProjects, getProjectSectors } from "@/data/projects";
import { getSectionByKey } from "@/data/sections";
import { getPageMeta } from "@/data/pages";
import { WebPageJsonLd } from "@/components/seo/json-ld";
import { formatHeading } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("realisations", {
    title: "Réalisations",
    description:
      "Découvrez les projets réalisés par Prestigia Agency pour ses clients à Casablanca : sites web, SEO, branding, social media et publicité.",
    ogTitle: "Réalisations — Prestigia Agency",
  });
}

export default async function RealisationsPage() {
  const [projects, sectors, hero] = await Promise.all([
    getProjects(),
    getProjectSectors(),
    getSectionByKey("realisations", "hero"),
  ]);

  return (
    <>
      <WebPageJsonLd
        title="Réalisations — Prestigia Agency"
        description="Projets digitaux réalisés pour nos clients à Casablanca : SEO, publicité, branding, web."
        path="/realisations"
        breadcrumbs={[{ name: "Réalisations", href: "/realisations" }]}
      />
      <RealisationsDnaExperience
        projects={projects}
        sectors={sectors}
        heroTitle={formatHeading(hero?.title || "Nos réalisations digitales")}
        heroSubtitle={
          hero?.subtitle ||
          "Découvrez comment nous accompagnons nos clients à travers des projets qui allient créativité, expertise et performance."
        }
      />
    </>
  );
}
