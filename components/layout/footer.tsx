import type { SVGProps } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <footer
      className="relative mt-8"
      style={{
        borderTop: "1px solid rgba(124,58,237,0.18)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: "rgba(4,3,10,0.75)",
      }}
      aria-label="Pied de page"
    >
      {/* Ligne lumineuse en haut */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{
          background: "linear-gradient(to right, transparent, rgba(124,58,237,0.5), transparent)",
        }}
      />
      {/* Lueur au-dessus du footer */}
      <div
        aria-hidden="true"
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(124,58,237,0.1), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-4">

          {/* Colonne marque */}
          <div>
            <Link href="/" aria-label="Prestigia Agency — Accueil">
              <Image src="/logo-prestigia.png" alt="Prestigia Agency" width={125} height={56} className="h-8 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Transformez votre présence digitale avec notre expertise en marketing stratégique et développement web.
            </p>
            {/* Réseaux — hover géré par CSS (.social-link) */}
            <ul className="mt-6 flex gap-4 list-none p-0" aria-label="Nos réseaux sociaux">
              {instagram && (
                <li>
                  <Link href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Prestigia Agency sur Instagram" className="social-link">
                    <InstagramIcon className="size-5" />
                  </Link>
                </li>
              )}
              {linkedin && (
                <li>
                  <Link href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="Prestigia Agency sur LinkedIn" className="social-link">
                    <LinkedinIcon className="size-5" />
                  </Link>
                </li>
              )}
              {facebook && (
                <li>
                  <Link href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Prestigia Agency sur Facebook" className="social-link">
                    <FacebookIcon className="size-5" />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Navigation */}
          <nav aria-label="Navigation principale">
            <p className="text-sm font-normal text-white mb-4 tracking-wide">Navigation</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent-gold-text)] transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <address className="not-italic">
            <p className="text-sm font-normal text-white mb-4 tracking-wide">Contact</p>
            <ul className="space-y-2.5 text-sm text-[var(--muted-foreground)]">
              <li>
                <Link href={`tel:${phone}`} className="hover:text-[var(--accent-gold-text)] transition-colors duration-200" aria-label={`Appeler au ${phoneDisplay}`}>
                  {phoneDisplay}
                </Link>
              </li>
              <li>
                <Link href={`mailto:${email}`} className="hover:text-[var(--accent-gold-text)] transition-colors duration-200" aria-label={`Email : ${email}`}>
                  {email}
                </Link>
              </li>
              <li className="leading-relaxed">{address}<br />{city}</li>
            </ul>
          </address>

          {/* CTA */}
          <div>
            <p className="text-sm font-normal text-white mb-4 tracking-wide">
              Prêt à transformer votre présence digitale ?
            </p>
            <Link href="/devis" className="footer-cta-btn inline-flex items-center rounded-full font-normal text-white text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5">
              Demander un devis
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 flex flex-col gap-4 pt-8 text-xs text-[var(--muted-foreground)] md:flex-row md:items-center md:justify-between"
          style={{ borderTop: "1px solid rgba(124,58,237,0.12)" }}
        >
          <p>© {new Date().getFullYear()} Prestigia Agency. Tous droits réservés.</p>
          <nav aria-label="Liens légaux">
            <div className="flex gap-6">
              <Link href="/mentions-legales" className="hover:text-[var(--accent-gold-text)] transition-colors">Mentions légales</Link>
              <Link href="/confidentialite" className="hover:text-[var(--accent-gold-text)] transition-colors">Confidentialité</Link>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
