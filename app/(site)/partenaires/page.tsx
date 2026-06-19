import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { getPartners } from "@/data/partners";

export const metadata: Metadata = {
  title: "Partenaires",
  description: "Les marques et entreprises qui font confiance à Prestigia Agency pour leur stratégie marketing digital.",
  alternates: { canonical: "/partenaires" },
};

export default async function PartenairesPage() {
  const partners = await getPartners();
  return (
    <>
      <section className="container-px mx-auto max-w-5xl py-20">
        <SectionHeading eyebrow="Partenaires" title="Ils nous font confiance" />
        <div className="mt-14 grid sm:grid-cols-2 gap-8">
          {partners.map((p) => (
            <div key={p.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-8">
              <h2 className="font-serif text-xl">{p.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              {p.website && (
                <Link href={p.website} target="_blank" className="mt-3 inline-block text-sm text-[var(--accent-gold)]">
                  Visiter le site →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
