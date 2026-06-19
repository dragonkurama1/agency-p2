import Link from "next/link";
import { siteConfig, navLinks } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <p className="font-serif text-lg text-[var(--foreground)]">
              PRESTIGIA<span className="text-[var(--accent-gold)]">.</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Transformez votre présence digitale avec notre expertise en marketing stratégique et développement web.
            </p>
          </div>

          <div>
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
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>{siteConfig.phoneDisplay}</li>
              <li>{siteConfig.email}</li>
              <li>
                {siteConfig.address.city}, {siteConfig.address.district}
                <br />
                {siteConfig.address.street}
              </li>
            </ul>
          </div>

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
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="hover:text-[var(--accent-gold)]">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-[var(--accent-gold)]">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
