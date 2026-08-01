"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Trash2, Film } from "lucide-react";
import { deleteMediaRow } from "@/actions/media";

function MediaPreview({ url, fileType, altText }: { url: string; fileType: string; altText: string }) {
  if (fileType?.startsWith("video/")) {
    return (
      <video
        src={url}
        className="h-full w-full object-cover"
        muted
        preload="metadata"
        aria-label={altText || "Vidéo"}
      />
    );
  }
  if (fileType?.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={altText || ""} className="h-full w-full object-cover" loading="lazy" />;
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
      <Film className="size-6 opacity-40" />
      <span>{fileType || "fichier"}</span>
    </div>
  );
}

export function MediaGrid({ rows }: { rows: Record<string, string>[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-[var(--border)] p-10 text-center text-sm text-muted-foreground">
        Aucun média. Envoyez un fichier ci-dessus.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((row) => {
        const fileUrl = row.file_url || "";
        return (
          <div key={row.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-[var(--background)]">
              <MediaPreview url={fileUrl} fileType={row.file_type} altText={row.alt_text || row.file_name} />
            </div>
            <p className="mt-2 truncate text-xs" title={row.file_name}>
              {row.file_name}
            </p>
            {row.file_type?.startsWith("video/") && (
              <p className="text-xs text-[var(--accent-gold)]">Vidéo</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fileUrl);
                  setCopiedId(row.id);
                  setTimeout(() => setCopiedId(null), 1500);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--accent-gold)]"
                title="Copier l'URL"
              >
                {copiedId === row.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedId === row.id ? "Copié" : "Copier l'URL"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm("Retirer ce média de la bibliothèque ?")) return;
                  startTransition(async () => {
                    await deleteMediaRow(row.id);
                  });
                }}
                className="text-muted-foreground hover:text-red-500"
                title="Supprimer"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
