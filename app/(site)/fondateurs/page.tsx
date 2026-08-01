import type { Metadata } from "next";
import type { SVGProps } from "react";
import { getPageMeta } from "@/data/pages";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getTeam } from "@/data/team";
import { getSectionByKey } from "@/data/sections";
import { normalizeImageUrl } from "@/lib/parse";
import { WebPageJsonLd, PersonJsonLd } from "@/components/seo/json-ld";

/** Icônes SVG inline (lucide-react ne fournis plus les icônes de marques). */
function Linkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6Z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function Instagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("fondateurs", {
    title: "Fondateurs",
    description:
      "Découvrez Abdelkader Naim et Ahmed Ghiwane, co-fondateurs de Prestigia Agency, agence marketing digital à Casablanca. Deux experts du digital au service de votre croissance.",
    ogTitle: "Les Fondateurs — Prestigia Agency",
  });
}

export default async function FondateursPage() {
  const [team, hero] = await Promise.all([getTeam(), getSectionByKey("fondateurs", "hero")]);

  return (
    <>
      <WebPageJsonLd
        title="Fondateurs — Prestigia Agency"
        description="Les co-fondateurs de Prestigia Agency, agence marketing digital à Casablanca."
        path="/fondateurs"
        breadcrumbs={[{ name: "Fondateurs", href: "/fondateurs" }]}
      />
      {team.map((member) => (
        <PersonJsonLd
          key={member.id}
          name={member.name}
          role={member.role}
          bio={member.bio}
          linkedin={member.linkedin}
          instagram={member.instagram}
          photo={normalizeImageUrl(member.photo_url)}
        />
      ))}

      <section className="container-px mx-auto max-w-5xl py-20">
        <SectionHeading
          eyebrow="L'équipe"
          title={hero?.title || "Les fondateurs de Prestigia Agency"}
          subtitle={hero?.subtitle || "Deux profils complémentaires, une même conviction : le digital doit produire des résultats mesurables."}
        />
        <div className="mt-14 grid sm:grid-cols-2 gap-10">
          {team.map((member) => (
            <article key={member.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-8">
              {member.photo_url ? (
                <img
                  src={normalizeImageUrl(member.photo_url)}
                  alt={`Photo de ${member.name}, ${member.role} chez Prestigia Agency`}
                  className="aspect-square w-24 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="aspect-square w-24 rounded-full bg-[linear-gradient(135deg,var(--border),var(--background))]"
                  aria-hidden="true"
                />
              )}
              <h2 className="mt-6 font-serif text-2xl">{member.name}</h2>
              <p className="text-sm text-[var(--accent-gold)]">{member.role}</p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              <div className="mt-5 flex gap-3">
                {member.linkedin && (
                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    className="text-muted-foreground hover:text-[var(--accent-gold)]"
                  >
                    <Linkedin className="size-5" />
                  </Link>
                )}
                {member.instagram && (
                  <Link
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${member.name}`}
                    className="text-muted-foreground hover:text-[var(--accent-gold)]"
                  >
                    <Instagram className="size-5" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
