"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { deleteMediaRow } from "@/actions/media";

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
      {rows.map((row) => (
        <div key={row.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-3">
          <div className="aspect-square overflow-hidden rounded-lg bg-[var(--background)]">
            {row.file_type?.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.drive_url} alt={row.alt_text || row.file_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{row.file_type}</div>
            )}
          </div>
          <p className="mt-2 truncate text-xs" title={row.file_name}>
            {row.file_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{row.folder}</p>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(row.drive_url);
                setCopiedId(row.id);
                setTimeout(() => setCopiedId(null), 1500);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--accent-gold)]"
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
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
