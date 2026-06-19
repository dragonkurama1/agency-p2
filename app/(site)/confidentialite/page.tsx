import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false, follow: true },
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <section className="container-px mx-auto max-w-2xl py-20 prose">
      <h1 className="font-serif text-3xl mb-6">Politique de confidentialité</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Les informations collectées via nos formulaires (contact, devis) sont utilisées exclusivement pour répondre
        à votre demande et ne sont jamais cédées à des tiers. Vous pouvez demander la suppression de vos données à
        tout moment en nous contactant à {siteConfig.email}.
      </p>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
        Ce site n&apos;utilise pas de cookies publicitaires tiers. Des cookies techniques peuvent être utilisés pour
        assurer le bon fonctionnement du site.
      </p>
    </section>
  );
}
