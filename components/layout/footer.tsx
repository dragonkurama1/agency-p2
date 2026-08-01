import type { SVGProps } from "react";
import Link from "next/link";
import { siteConfig, navLinks } from "@/lib/site-config";
import { getSetting } from "@/data/settings";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6Z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export async function Footer() {
  const [phone, phoneDisplay, email, address, city, instagram, linkedin, facebook] = await Promise.all([
    getSetting("site_phone", siteConfig.phone),
    getSetting("site_phone_display", siteConfig.phoneDisplay),
    getSetting("site_email", siteConfig.email),
    getSetting("site_address", `${siteConfig.address.street}, ${siteConfig.address.district}`),
    getSetting("site_city", siteConfig.address.city),
    getSetting("instagram_url", siteConfig.social.instagram),
    getSetting("linkedin_url", siteConfig.social.linkedin),
    getSetting("facebook_url", siteConfig.social.facebook),
  ]);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]" aria-label="Pied de page">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <p className="font-serif text-lg text-[var(--foreground)]">
              PRESTIGIA<span className="text-[var(--accent-gold)]">.</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Transformez votre présence digitale avec notre expertise en marketing stratégique et développement web.
            </p>
            {/* Réseaux sociaux */}
            <ul className="mt-6 flex gap-4 list-none p-0" aria-label="Nos réseaux sociaux">
              {instagram && (
                <li>
                  <Link href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Prestigia Agency sur Instagram" className="text-[var(--muted-foreground)] hover:text-[var(--accent-gold)] transition-colors">
                    <InstagramIcon className="size-5" />
                  </Link>
                </li>
              )}
              {linkedin && (
                <li>
                  <Link href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="Prestigia Agency sur LinkedIn" className="text-[var(--muted-foreground)] hover:text-[var(--accent-gold)] transition-colors">
                    <LinkedinIcon className="size-5" />
                  </Link>
                </li>
              )}
              {facebook && (
                <li>
                  <Link href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Prestigia Agency sur Facebook" className="text-[var(--muted-foreground)] hover:text-[var(--accent-gold)] transition-colors">
                    <FacebookIcon className="size-5" />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <nav aria-label="Navigation principale">
            <p className="text-sm font-medium text-[var(--foreground)]">Navigation</p>
            <ul className="mt-4 space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent-gold)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic">
            <p className="text-sm font-medium text-[var(--foreground)]">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>
                <Link href={`tel:${phone}`} className="hover:text-[var(--accent-gold)]" aria-label={`Appeler au ${phoneDisplay}`}>
                  {phoneDisplay}
                </Link>
              </li>
              <li>
                <Link href={`mailto:${email}`} className="hover:text-[var(--accent-gold)]" aria-label={`Email : ${email}`}>
                  {email}
                </Link>
              </li>
              <li>
                {address}
                <br />
                {city}
              </li>
            </ul>
          </address>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Prêt à transformer votre présence digitale ?</p>
            <Link
              href="/devis"
              className="mt-4 inline-block rounded-full bg-[var(--accent-gold)] px-6 py-3 text-sm font-medium text-[#0a0a0b] hover:bg-[var(--accent-gold-hover)]"
            >
              Demander un devis
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Prestigia Agency. Tous droits réservés.</p>
          <nav aria-label="Liens légaux">
            <div className="flex gap-6">
              <Link href="/mentions-legales" className="hover:text-[var(--accent-gold)]">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:text-[var(--accent-gold)]">Confidentialité</Link>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
