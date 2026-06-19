import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: true },
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <section className="container-px mx-auto max-w-2xl py-20 prose">
      <h1 className="font-serif text-3xl mb-6">Mentions légales</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {siteConfig.legalName}, ayant son siège social au {siteConfig.address.street}, {siteConfig.address.district},{" "}
        {siteConfig.address.city}, Maroc. Contact : {siteConfig.email} — {siteConfig.phoneDisplay}.
      </p>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Le présent site est édité par {siteConfig.legalName}. Toute reproduction, totale ou partielle, du contenu de
        ce site sans autorisation préalable est interdite.
      </p>
    </section>
  );
}
