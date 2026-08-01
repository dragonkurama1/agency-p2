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
  const mapQuery = encodeURIComponent(`${address}, ${city}`);

  return (
    <>
      <WebPageJsonLd
        title="Contact — Prestigia Agency"
        description="Contactez Prestigia Agency à Casablanca par téléphone, email ou formulaire."
        path="/contact"
        breadcrumbs={[{ name: "Contact", href: "/contact" }]}
      />
      <section className="container-px mx-auto max-w-6xl py-20" aria-label="Coordonnées et formulaire de contact">
        <SectionHeading eyebrow="Contact" title={hero?.title || "Discutons de votre projet"} subtitle={hero?.subtitle || undefined} />
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

            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)]">
              <iframe
                title="Localisation Prestigia Agency — Casablanca"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </address>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 sm:p-8">
            <h2 className="font-serif text-xl mb-6">Envoyez-nous un message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
