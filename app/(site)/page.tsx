import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { WhyUs } from "@/components/marketing/why-us";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { Testimonials } from "@/components/marketing/testimonials";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Button } from "@/components/ui/button";
import { getServices } from "@/data/services";
import { getTestimonials } from "@/data/testimonials";
import { getProjects } from "@/data/projects";
import { getFaqByPage } from "@/data/faq";
import { homeFaq } from "@/lib/seed-data";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Agence Marketing Digital à Casablanca",
  description:
    "Prestigia Agency est une agence marketing digital à Casablanca : stratégie, SEO, publicité, branding, création de contenu et développement web orientés résultats.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [services, testimonials, projects, faq] = await Promise.all([
    getServices(),
    getTestimonials(),
    getProjects(),
    getFaqByPage("accueil"),
  ]);

  return (
    <>
      <Hero />
      <StatsBar />

      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading
          eyebrow="Nos services"
          title="Une agence digitale à Casablanca pensée pour les marques qui veulent grandir"
          subtitle="Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats."
        />
        <div className="mt-12">
          <ServicesGrid services={services} compact />
        </div>
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/services">Voir tous nos services <ArrowUpRight className="size-4" /></Link>
          </Button>
        </div>
      </section>

      <section className="section-light py-20">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Pourquoi Prestigia" title="Une équipe, tous les leviers de croissance" />
          <div className="mt-12">
            <WhyUs />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading eyebrow="Nos réalisations" title="Des résultats concrets pour nos clients" align="center" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <Link
              key={project.slug}
              href={`/realisations/${project.slug}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden"
            >
              <div className="aspect-[4/3] bg-[linear-gradient(135deg,var(--border),var(--muted))]" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-wide text-[var(--accent-gold)]">{project.category}</p>
                <h3 className="mt-2 font-serif text-lg leading-snug">{project.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{project.results}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/realisations">Voir toutes nos réalisations <ArrowUpRight className="size-4" /></Link>
          </Button>
        </div>
      </section>

      <section className="section-light py-20">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Notre méthode" title="Un processus clair, en 4 étapes" align="center" />
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading eyebrow="Témoignages" title="Ce que nos clients disent de nous" align="center" />
        <div className="mt-12">
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      <section className="section-light py-20">
        <div className="container-px mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions fréquentes" align="center" />
          <div className="mt-10">
            <FaqSection items={faq.length ? faq : homeFaq} />
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
