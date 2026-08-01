import type { Metadata } from "next";
import Link from "next/link";
import { entities, entityKeys } from "@/lib/entities";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { RevalidateButton } from "@/components/dashboard/revalidate-button";

export const metadata: Metadata = {
  title: "Dashboard — Prestigia Agency",
  robots: { index: false, follow: false },
};

export default function DashboardHome() {
  const serviceKeyConfigured =
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("REMPLACER");

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Vue d&apos;ensemble</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérez tout le contenu du site depuis ce dashboard.</p>
        </div>
        <RevalidateButton />
      </div>

      {!serviceKeyConfigured && (
        <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-600">
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong> non configurée. Ajoutez-la dans <code>.env.local</code> depuis
          Supabase Dashboard → Settings → API. Le site public fonctionne, mais les écritures admin sont désactivées.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entityKeys.map((key) => (
          <Link key={key} href={`/dashboard/${key}`}>
            <Card className="h-full hover:border-[var(--accent-gold)]">
              <CardTitle>{entities[key].label}</CardTitle>
              <CardDescription>{entities[key].description || `Table "${entities[key].tab}"`}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
