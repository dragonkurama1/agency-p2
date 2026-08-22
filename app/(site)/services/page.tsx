import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getServices } from "@/data/services";
import { getSectionByKey } from "@/data/sections";
import { getPageMeta } from "@/data/pages";
import { WebPageJsonLd } from "@/components/seo/json-ld";
import { ArrowUpRight, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

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
      <section className="container-px mx-auto max-w-7xl py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Nos services"
          title={hero?.title || "Services marketing digital premium à Casablanca"}
          subtitle={
            hero?.subtitle ||
            "Stratégie, création de contenu, publicité, SEO, sites web et automatisation : nous relions chaque levier à un objectif clair de visibilité, de leads et de conversion."
          }
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: MapPin, label: "Marché", value: "Casablanca / Maroc" },
            { icon: Sparkles, label: "Approche", value: "Création + performance" },
            { icon: CheckCircle2, label: "Livrable", value: "Plan, contenu, suivi" },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-lg border border-white/[0.1] bg-black/[0.24] p-4 backdrop-blur-md">
                <Icon aria-hidden="true" className="size-4 text-[var(--accent-gold-text)]" />
                <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/42">{item.label}</p>
                <p className="mt-1 text-sm text-white/82">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <ServicesGrid services={services} />
        </div>
        <div className="mt-10">
          <Link
            href="/realisations"
            className="inline-flex items-center gap-2 text-sm text-[var(--accent-gold-text)] transition-colors hover:text-white"
          >
            Voir les réalisations liées à nos services
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
