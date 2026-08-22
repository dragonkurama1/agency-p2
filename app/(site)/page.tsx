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
import type { Project } from "@/data/projects";
import { getFaqByPage } from "@/data/faq";
import { getSectionByKey } from "@/data/sections";
import { homeFaq } from "@/lib/seed-data";
import { normalizeImageUrl, shouldBypassImageOptimization } from "@/lib/parse";
import { WebPageJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Camera, LineChart, Target } from "lucide-react";

function HomeProofBand({
  featuredProject,
}: {
  featuredProject?: Project;
}) {
  return (
    <section className="container-px relative z-20 mx-auto mt-8 max-w-7xl pb-10 sm:mt-10 lg:-mt-12 lg:pb-12" aria-label="Preuves Prestigia Agency">
      <div className="grid gap-3 rounded-lg border border-white/[0.1] bg-black/[0.42] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl lg:grid-cols-[1fr_1.05fr]">
        <div className="grid gap-px overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
          {[
            { icon: Target, title: "Vision", text: "Objectif, cible et angle clair" },
            { icon: Camera, title: "Production", text: "Photo, vidéo, web et contenu" },
            { icon: LineChart, title: "Mesure", text: "Publication, suivi, amélioration" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="bg-black/[0.38] px-4 py-4 sm:px-5">
                <Icon aria-hidden="true" className="size-4 text-[var(--accent-gold-text)]" />
                <p className="mt-3 font-serif text-2xl leading-none text-white">{item.title}</p>
                <p className="mt-1 text-[11px] leading-5 text-white/52 sm:text-xs">{item.text}</p>
              </div>
            );
          })}
        </div>

        {featuredProject && (
          <Link
            href={`/realisations/${featuredProject.slug}`}
            title={`Voir le projet ${featuredProject.title}`}
            className="group grid gap-4 rounded-md border border-[var(--accent-gold)]/20 bg-[var(--accent-gold)]/[0.07] p-3 transition-colors hover:border-[var(--accent-gold)]/50 sm:grid-cols-[112px_1fr_auto] sm:items-center"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-black sm:aspect-square">
              {featuredProject.cover_image ? (
                <Image
                  src={normalizeImageUrl(featuredProject.cover_image)}
                  alt={featuredProject.title}
                  fill
                  sizes="112px"
                  unoptimized={shouldBypassImageOptimization(featuredProject.cover_image)}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/24 to-transparent" />
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-[var(--accent-gold-text)]">Cas projet</p>
              <p className="mt-1 font-serif text-2xl leading-none text-white">{featuredProject.title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/58">{featuredProject.results || featuredProject.description}</p>
            </div>
            <span className="hidden size-10 items-center justify-center rounded-md border border-white/[0.12] text-[var(--accent-gold-text)] transition-transform group-hover:-translate-y-0.5 sm:flex">
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

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
  const sectorCount = new Set(projects.map((project) => project.sector || project.category).filter(Boolean)).size;
  const featuredProject = projects.find((project) => project.featured) ?? projects[0];

  return (
    <>
      <WebPageJsonLd
        title="Prestigia Agency — Agence Marketing Digital Casablanca"
        description="Stratégie, SEO, GEO, publicité Google & Meta, branding et développement web à Casablanca."
        path="/"
      />
      {faqItems.length > 0 && <FaqJsonLd items={faqItems} />}

      <Hero
        section={heroSection}
        proofItems={[
          { label: "Base", value: "Casablanca" },
          { label: "Projets", value: projects.length.toString() },
          { label: "Secteurs", value: sectorCount.toString() },
          { label: "Services", value: services.length.toString() },
        ]}
      />
      <HomeProofBand
        featuredProject={featuredProject}
      />
      <PartnersMarquee />

      <section className="container-px mx-auto max-w-7xl py-16" aria-label="Nos services">
        <SectionHeading
          eyebrow="Nos services"
          title="Une agence digitale à Casablanca pour grandir"
          subtitle="Du SEO à la publicité, du branding au développement web — chaque service est conçu pour attirer vos prospects, engager votre audience et convertir vos visiteurs en clients."
        />
        <div className="mt-12">
          <ServicesGrid services={services} compact />
        </div>
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/services" title="Voir tous nos services">
              Voir tous nos services <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16" aria-label="Pourquoi choisir Prestigia Agency">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Pourquoi Prestigia" title="Une équipe, tous les leviers de croissance" />
          <div className="mt-12">
            <WhyUs />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16" aria-label="Nos réalisations">
        <SectionHeading eyebrow="Nos réalisations" title="Des résultats concrets pour nos clients" align="center" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <Link
              key={project.slug}
              href={`/realisations/${project.slug}`}
              title={`Voir le projet ${project.title}`}
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
            <Link href="/realisations" title="Voir toutes nos réalisations">
              Voir toutes nos réalisations <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16" aria-label="Notre méthode de travail">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading eyebrow="Notre méthode" title="Un processus clair, en 4 étapes" align="center" />
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16" aria-label="Témoignages clients">
        <SectionHeading eyebrow="Témoignages" title="Ce que nos clients disent de nous" align="center" />
        <div className="mt-12">
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      <section className="py-16" aria-label="Questions fréquentes">
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
