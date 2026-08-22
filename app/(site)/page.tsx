import type { Metadata } from "next";
import { getPageMeta } from "@/data/pages";
import { Hero } from "@/components/marketing/hero";
import { PartnersMarquee } from "@/components/marketing/partners-marquee";
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
import { getSectionByKey } from "@/data/sections";
import { homeFaq } from "@/lib/seed-data";
import { normalizeImageUrl, shouldBypassImageOptimization } from "@/lib/parse";
import { WebPageJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("home", {
    title: "Agence Marketing Digital à Casablanca",
    description:
      "Prestigia Agency est une agence marketing digital à Casablanca : stratégie, SEO, publicité, branding, création de contenu et développement web orientés résultats.",
    ogTitle: "Prestigia Agency — Agence Marketing Digital Casablanca",
    canonical: "/",
  });
}

export default async function HomePage() {
  const [services, testimonials, projects, faq, heroSection, ctaSection] = await Promise.all([
    getServices(),
    getTestimonials(),
    getProjects(),
    getFaqByPage("accueil"),
    getSectionByKey("home", "hero"),
    getSectionByKey("home", "cta"),
  ]);
  // PartnersMarquee fetches partners autonomously (server component)

  const faqItems = faq.length ? faq : homeFaq;

  return (
    <>
      <WebPageJsonLd
        title="Prestigia Agency — Agence Marketing Digital Casablanca"
        description="Stratégie, SEO, GEO, publicité Google & Meta, branding et développement web à Casablanca."
        path="/"
      />
      {faqItems.length > 0 && <FaqJsonLd items={faqItems} />}

      <Hero section={heroSection} />
      <PartnersMarquee />

      <section className="container-px mx-auto max-w-7xl py-20" aria-label="Nos services">
        <SectionHeading
          eyebrow="Nos services"
          title="Une agence digitale à Casablanca pensée pour les marques qui veulent grandir"
          subtitle="Du SEO à la publicité, du branding au développement web — chaque service est conçu pour attirer vos prospects, engager votre audience et convertir vos visiteurs en clients."
        />
        <div className="mt-12">
          <ServicesGrid services={services} compact />
        </div>
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/services">
              Voir tous nos services <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-20" aria-label="Pourquoi choisir Prestigia Agency">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Pourquoi Prestigia" title="Une équipe, tous les leviers de croissance" />
          <div className="mt-12">
            <WhyUs />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20" aria-label="Nos réalisations">
        <SectionHeading eyebrow="Nos réalisations" title="Des résultats concrets pour nos clients" align="center" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <Link
              key={project.slug}
              href={`/realisations/${project.slug}`}
              className="group glass-card rounded-2xl overflow-hidden flex flex-col"
            >
              {project.cover_image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={normalizeImageUrl(project.cover_image)}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={shouldBypassImageOptimization(project.cover_image)}
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div
                  className="aspect-[4/3]"
                  style={{
                    background: "linear-gradient(135deg, rgb(var(--accent-gold-rgb) / 0.15), rgba(79,70,229,0.08))",
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="p-6 flex-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent-gold-text)] mb-2">
                  {project.category}
                </p>
                <h3 className="font-serif text-lg leading-snug text-white group-hover:text-glow transition-all duration-300">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {project.results}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/realisations">
              Voir toutes nos réalisations <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-20" aria-label="Notre méthode de travail">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Notre méthode" title="Un processus clair, en 4 étapes" align="center" />
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-20" aria-label="Témoignages clients">
        <SectionHeading eyebrow="Témoignages" title="Ce que nos clients disent de nous" align="center" />
        <div className="mt-12">
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      <section className="py-20" aria-label="Questions fréquentes">
        <div className="container-px mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions fréquentes" align="center" />
          <div className="mt-10">
            <FaqSection items={faqItems} />
          </div>
        </div>
      </section>

      <CtaBanner
        title={ctaSection?.title || undefined}
        subtitle={ctaSection?.subtitle || undefined}
        cta={ctaSection?.button_text || undefined}
        href={ctaSection?.button_link || undefined}
      />
    </>
  );
}
