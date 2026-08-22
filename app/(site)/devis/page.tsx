import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { DevisForm } from "@/components/forms/devis-form";
import { getServices } from "@/data/services";
import { getPageMeta } from "@/data/pages";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("devis", {
    title: "Demander un devis",
    description: "Demandez un devis gratuit à Prestigia Agency pour votre projet de marketing digital, site web, SEO ou publicité à Casablanca.",
  });
}

export default async function DevisPage() {
  const services = await getServices();
  return (
    <section className="container-px mx-auto max-w-4xl py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Devis gratuit"
        title="Parlons de votre projet digital"
        subtitle="Quatre étapes, deux minutes. Nous vous répondons sous 24h ouvrées avec une première direction claire."
      />
      <div className="mt-10 grid gap-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6 text-sm leading-7 text-muted-foreground sm:grid-cols-3 sm:p-8">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Un devis basé sur votre contexte</h2>
          <p className="mt-3">
            Un bon devis marketing ne se limite pas à une liste de services. Il doit tenir compte de votre offre, de
            votre cible, de votre concurrence, de votre budget, de vos supports existants et de la vitesse à laquelle
            vous voulez obtenir des résultats.
          </p>
        </div>
        <p>
          Prestigia Agency analyse votre besoin pour proposer un ordre d&apos;action réaliste : stratégie digitale, création
          de site web, SEO, publicité Google ou Meta, contenu photo et vidéo, branding, automatisation WhatsApp ou
          accompagnement global. Chaque option est reliée à un objectif mesurable.
        </p>
        <p>
          Plus votre demande est précise, plus la réponse sera utile. Ajoutez vos liens actuels, vos concurrents, vos
          délais, les canaux que vous utilisez déjà et le type de résultat attendu : appels, leads qualifiés, visites,
          réservations, ventes ou meilleure image de marque.
        </p>
      </div>
      <div className="mt-8 rounded-lg border border-[var(--border)] p-6">
        <h2 className="font-serif text-2xl">Services disponibles dans le formulaire</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Vous pouvez sélectionner un ou plusieurs services selon votre priorité. Nous ajustons ensuite la proposition
          pour éviter les actions inutiles et construire un plan cohérent avec votre marché.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {services.slice(0, 10).map((service) => (
            <li key={service.slug} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-muted-foreground">
              {service.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-serif text-2xl">Après l&apos;envoi de la demande</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Nous relisons votre besoin, vérifions les supports partagés et préparons une première réponse orientée
            décision. Selon le projet, cette réponse peut inclure les priorités à traiter, les livrables recommandés,
            les informations manquantes et une estimation de l&apos;effort nécessaire.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-serif text-2xl">Une proposition claire</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Le but est de vous aider à choisir sans confusion : démarrer par une mission courte, structurer un
            accompagnement mensuel, créer une campagne, améliorer une page ou produire un contenu prioritaire. Le devis
            doit expliquer ce qui sera fait, dans quel ordre et avec quel objectif.
          </p>
        </article>
      </div>
      <div className="mt-12">
        <DevisForm services={services} />
      </div>
    </section>
  );
}
