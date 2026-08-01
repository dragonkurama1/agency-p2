import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPageMeta } from "@/data/pages";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getPartners } from "@/data/partners";
import { getSectionByKey } from "@/data/sections";
import { normalizeImageUrl } from "@/lib/parse";
import { WebPageJsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("partenaires", {
    title: "Partenaires",
    description:
      "Les marques et entreprises qui font confiance à Prestigia Agency pour leur stratégie marketing digital à Casablanca.",
    ogTitle: "Nos Partenaires — Prestigia Agency",
  });
}

export default async function PartenairesPage() {
  const [partners, hero] = await Promise.all([getPartners(), getSectionByKey("partenaires", "hero")]);
  return (
    <>
      <WebPageJsonLd
        title="Partenaires — Prestigia Agency"
        description="Marques et entreprises accompagnées par Prestigia Agency à Casablanca."
        path="/partenaires"
        breadcrumbs={[{ name: "Partenaires", href: "/partenaires" }]}
      />
      <section className="container-px mx-auto max-w-5xl py-20" aria-label="Nos partenaires">
        <SectionHeading eyebrow="Partenaires" title={hero?.title || "Ils nous font confiance"} subtitle={hero?.subtitle || undefined} />
        <div className="mt-14 grid sm:grid-cols-2 gap-8">
          {partners.map((p) => (
            <article key={p.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-8">
              {p.logo_url && (
                <Image
                  src={normalizeImageUrl(p.logo_url)}
                  alt={`Logo ${p.name}`}
                  width={160}
                  height={48}
                  className="mb-4 h-12 w-auto max-w-[160px] object-contain"
                />
              )}
              <h2 className="font-serif text-xl">{p.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              {p.website && (
                <Link
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visiter le site de ${p.name}`}
                  className="mt-3 inline-block text-sm text-[var(--accent-gold)] hover:underline"
                >
                  Visiter le site →
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
