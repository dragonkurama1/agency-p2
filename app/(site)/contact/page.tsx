import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Prestigia Agency à Casablanca par téléphone, email, WhatsApp ou via notre formulaire en ligne.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mapQuery = encodeURIComponent(
    `${siteConfig.address.street}, ${siteConfig.address.district}, ${siteConfig.address.city}`
  );

  return (
    <section className="container-px mx-auto max-w-6xl py-20">
      <SectionHeading eyebrow="Contact" title="Discutons de votre projet" />
      <div className="mt-12 grid lg:grid-cols-[1fr_1.2fr] gap-12">
        <div className="space-y-8">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-[var(--accent-gold)]" />
            <p className="text-sm">
              {siteConfig.address.street}, {siteConfig.address.district}
              <br />
              {siteConfig.address.city}, {siteConfig.address.postalCode}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 text-[var(--accent-gold)]" />
            <Link href={`tel:${siteConfig.phone}`} className="text-sm hover:text-[var(--accent-gold)]">
              {siteConfig.phoneDisplay}
            </Link>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 text-[var(--accent-gold)]" />
            <Link href={`mailto:${siteConfig.email}`} className="text-sm hover:text-[var(--accent-gold)]">
              {siteConfig.email}
            </Link>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 text-[var(--accent-gold)]" />
            <div className="text-sm space-y-1">
              {siteConfig.hours.map((h) => (
                <p key={h.days}>
                  {h.days} : {h.hours}
                </p>
              ))}
            </div>
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)]">
            <iframe
              title="Localisation Prestigia Agency"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
