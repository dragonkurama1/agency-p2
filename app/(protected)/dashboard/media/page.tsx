import type { Metadata } from "next";
import { getEntityRows } from "@/lib/dashboard-data";
import { MediaUploadForm } from "@/components/forms/media-upload-form";
import { MediaGrid } from "@/components/dashboard/media-grid";

export const metadata: Metadata = {
  title: "Médias — Dashboard",
  robots: { index: false, follow: false },
};

export default async function MediaPage() {
  const rows = await getEntityRows("media");

  return (
    <div>
      <h1 className="font-serif text-2xl">Médias</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Fichiers envoyés vers Google Drive. Copiez l&apos;URL pour l&apos;utiliser dans les champs &quot;image&quot; des autres contenus.
      </p>
      <div className="mt-6">
        <MediaUploadForm />
      </div>
      <MediaGrid rows={rows} />
    </div>
  );
}
