import type { Metadata } from "next";
import Link from "next/link";
import { entities, entityKeys } from "@/lib/entities";
import { isGoogleSheetsConfigured } from "@/lib/google/sheets";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard — Prestigia Agency",
  robots: { index: false, follow: false },
};

export default function DashboardHome() {
  const configured = isGoogleSheetsConfigured();

  return (
    <div>
      <h1 className="font-serif text-2xl">Vue d&apos;ensemble</h1>
      <p className="mt-1 text-sm text-muted-foreground">Gérez tout le contenu du site depuis ce dashboard.</p>

      {!configured && (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-600">
          Google Sheets n&apos;est pas configuré (.env). Le site public affiche des données de démonstration ; ce
          dashboard ne peut pas encore lire ni écrire de contenu réel. Voir le README pour la configuration.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entityKeys.map((key) => (
          <Link key={key} href={`/dashboard/${key}`}>
            <Card className="h-full hover:border-[var(--accent-gold)]">
              <CardTitle>{entities[key].label}</CardTitle>
              <CardDescription>{entities[key].description || `Onglet "${entities[key].tab}"`}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
