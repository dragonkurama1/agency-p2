import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/lib/site-config";
import { getSectionByKey } from "@/data/sections";
import { getPageMeta } from "@/data/pages";
import { getSetting } from "@/data/settings";
import { WebPageJsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("contact", {
    title: "Contact",
    description:
      "Contactez Prestigia Agency à Casablanca par téléphone, email, WhatsApp ou via notre formulaire en ligne.",
    ogTitle: "Contactez Prestigia Agency — Casablanca",
  });
}

export default async function ContactPage() {
  const [hero, phone, phoneDisplay, email, address, city] = await Promise.all([
    getSectionByKey("contact", "hero"),
    getSetting("site_phone", siteConfig.phone),
    getSetting("site_phone_display", siteConfig.phoneDisplay),
    getSetting("site_email", siteConfig.email),
    getSetting("site_address", `${siteConfig.address.street}, ${siteConfig.address.district}`),
    getSetting("site_city", siteConfig.address.city),
  ]);

  return (
    <>
      <WebPageJsonLd
        title="Contact — Prestigia Agency"
        description="Contactez Prestigia Agency à Casablanca par téléphone, email ou formulaire."
        path="/contact"
        breadcrumbs={[{ name: "Contact", href: "/contact" }]}
      />
      <section className="container-px mx-auto max-w-6xl py-16 sm:py-20" aria-label="Coordonnées et formulaire de contact">
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title={hero?.title || "Discutons de votre projet digital à Casablanca"}
          subtitle={hero?.subtitle || "Expliquez-nous votre objectif, votre marché et vos priorités. Nous vous répondons avec une première orientation claire."}
        />
        <div className="mt-10 grid gap-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6 text-sm leading-7 text-muted-foreground sm:grid-cols-3 sm:p-8">
          <div>
            <h2 className="font-serif text-2xl text-foreground">Quand nous contacter</h2>
            <p className="mt-3">
              Contactez-nous pour un lancement, une refonte, une baisse de performance, un besoin de contenu ou une
              campagne à structurer. Même si votre idée n&apos;est pas encore complète, nous pouvons vous aider à clarifier la
              priorité.
            </p>
          </div>
          <p>
            Pour préparer une réponse utile, indiquez votre activité, votre zone de vente, vos objectifs, vos supports
            actuels et les résultats attendus : demandes de devis, visibilité locale, recrutement, image de marque,
            ventes en ligne ou meilleure organisation commerciale.
          </p>
          <p>
            Prestigia Agency répond avec une première orientation : leviers recommandés, points à vérifier, ordre des
            actions et type d&apos;accompagnement possible. L&apos;échange reste simple, concret et adapté au niveau de maturité
            digitale de votre entreprise.
          </p>
        </div>
        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Préparation du premier échange">
          <article className="rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-serif text-2xl">Ce que nous vérifions en premier</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Avant de proposer une solution, nous regardons la clarté de votre offre, la qualité de votre site, votre
              présence Google, vos réseaux sociaux, vos contenus existants et la façon dont les prospects peuvent vous
              contacter. Cette lecture rapide aide à repérer les freins visibles : message trop vague, manque de preuves,
              pages lentes, absence d&apos;appel à l&apos;action, budget publicitaire mal orienté ou suivi commercial incomplet.
            </p>
          </article>
          <article className="rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-serif text-2xl">Ce que vous gagnez avec un bon brief</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Un brief précis permet de gagner du temps et d&apos;obtenir une réponse plus réaliste. Si vous partagez vos
              objectifs, vos contraintes, vos exemples préférés, votre budget approximatif et vos délais, nous pouvons
              recommander un plan plus clair : action immédiate, contenu à produire, campagne à tester, page à créer ou
              parcours client à simplifier.
            </p>
          </article>
        </section>
        <p className="mt-8 max-w-3xl text-sm leading-7 text-muted-foreground">
          Vous pouvez aussi nous écrire pour une simple question avant devis : choix du service prioritaire, audit rapide
          de votre présence actuelle, préparation d&apos;une campagne ou besoin de rendre votre communication plus claire
          avant un lancement.
        </p>
        <div className="mt-12 grid lg:grid-cols-[1fr_1.2fr] gap-12">
          <address className="not-italic space-y-8">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <p className="text-sm">
                {address}
                <br />
                {city}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <Link
                href={`tel:${phone}`}
                title={`Appeler Prestigia Agency au ${phoneDisplay}`}
                className="text-sm hover:text-[var(--accent-gold)]"
                aria-label={`Appeler Prestigia Agency au ${phoneDisplay}`}
              >
                {phoneDisplay}
              </Link>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <Link
                href={`mailto:${email}`}
                title={`Envoyer un email à ${email}`}
                className="text-sm hover:text-[var(--accent-gold)]"
                aria-label={`Envoyer un email à ${email}`}
              >
                {email}
              </Link>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
              <dl className="text-sm space-y-1">
                {siteConfig.hours.map((h) => (
                  <div key={h.days} className="flex gap-1">
                    <dt>{h.days} :</dt>
                    <dd>{h.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Map — coordonnées exactes de la fiche Google Maps */}
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]" style={{ height: 320 }}>
              <iframe
                title="Localisation Prestigia Agency — Casablanca"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.5533808955406!2d-7.6125366!3d33.5341135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda62da17f9025e1%3A0xec275c050b84f450!2sPrestigia%20Agency!5e0!3m2!1sfr!2sma!4v1690000000000!5m2!1sfr!2sma"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://www.google.com/maps/place/Prestigia+Agency/@33.5341135,-7.6125366,17z"
              target="_blank"
              rel="noopener noreferrer"
              title="Voir Prestigia Agency sur Google Maps"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-gold)] hover:underline"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              Voir sur Google Maps
            </a>
          </address>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-6 sm:p-8">
            <h2 className="font-serif text-xl mb-6">Envoyez-nous un message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
